import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { CreateKnowledgeDto } from './dtos/create-knowledge.dto';
import { PrismaService } from '../../database/prisma.service';
import { EmbeddingService } from '../../rag/ingestion/embeddings/embedding.service';
import { QdrantService } from '../../rag/ingestion/embeddings/qdrant/qdrant.service';
import { LoggerService } from '../../common/logger/logger.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
    private readonly logger: LoggerService,
  ) {}

  findAll() {
    return this.prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.agent.findUnique({
      where: { id },
      include: {
        documents: true,
        chatSessions: true,
      },
    });
  }

  create(data: CreateAgentDto) {
    return this.prisma.agent.create({
      data: {
        businessId: data.businessId,
        name: data.name,
        welcomeMessage: data.welcomeMessage,
        systemPrompt: data.systemPrompt,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  update(id: string, data: UpdateAgentDto) {
    return this.prisma.agent.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.agent.delete({
      where: { id },
    });
  }

  findChats(agentId: string) {
    return this.prisma.chatSession.findMany({
      where: { agentId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  createChat(agentId: string) {
    return this.prisma.chatSession.create({
      data: {
        agentId,
        category: 'UNCLASSIFIED',
      },
    });
  }

  findKnowledge(agentId: string) {
    return this.prisma.document.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      include: {
        chunks: true
      }
    });
  }

  async addKnowledge(agentId: string, data: CreateKnowledgeDto) {
    const document = await this.prisma.document.create({
      data: {
        agentId,
        filename: data.title,
        mimeType: 'text/plain',
        fileSize: Buffer.byteLength(data.content, 'utf8'),
        r2Key: `manual/${agentId}/${Math.random().toString(36).substring(7)}`,
        status: 'COMPLETED',
        tags: ['manual'],
        metadata: { source: 'manual' },
        chunkCount: 1,
        chunks: {
          create: {
            chunkIndex: 0,
            content: data.content,
          }
        }
      },
      include: {
        chunks: true
      }
    });

    // Generate and index embedding asynchronously if key is present
    if (process.env.GEMINI_API_KEY && document.chunks && document.chunks.length > 0) {
      try {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        const chunk = document.chunks[0];
        const embedding = await this.embeddingService.generateEmbedding(chunk.content);
        await this.qdrantService.upsertPoint(
          chunk.id,
          embedding,
          {
            businessId: agent?.businessId || '',
            agentId: agentId,
            documentId: document.id,
            chunkId: chunk.id,
            parentId: null,
            chunkIndex: 0,
          }
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = (err instanceof Error ? err.stack : '') || '';
        this.logger.error(`Failed to generate and index embedding for manual knowledge: ${msg}`, stack);
      }
    }

    return document;
  }

  async removeKnowledge(agentId: string, knowledgeId: string) {
    // Delete from Qdrant first if possible
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: knowledgeId },
        include: { chunks: true }
      });
      if (document && document.chunks) {
        for (const chunk of document.chunks) {
          await this.qdrantService.deletePoint(chunk.id);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Could not delete vectors from Qdrant: ${msg}`);
    }

    return this.prisma.document.delete({
      where: { id: knowledgeId },
    });
  }

  async queryAgent(agentId: string, query: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent ${agentId} not found`);
    }

    let retrievedChunks: Array<{ content: string; documentName: string; score?: number }> = [];

    // Attempt vector search if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const queryVector = await this.embeddingService.generateEmbedding(query);
        const searchResults = await this.qdrantService.search(
          queryVector,
          agent.businessId,
          5,
          undefined,
          agentId,
        );

        if (searchResults && searchResults.length > 0) {
          const chunkIds = searchResults.map((r) => r.id as string).filter(Boolean);
          
          // Fetch chunk contents from Prisma
          const dbChunks = await this.prisma.chunk.findMany({
            where: { id: { in: chunkIds } },
            include: { document: true },
          });

          // Match back to preserve score ordering
          retrievedChunks = searchResults.map((res) => {
            const dbChunk = dbChunks.find((c) => c.id === res.id);
            return {
              content: dbChunk?.content || (res.payload?.content as string) || '',
              documentName: dbChunk?.document?.filename || (res.payload?.filename as string) || 'Document',
              score: res.score,
            };
          }).filter(c => c.content);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = (err instanceof Error ? err.stack : '') || '';
        this.logger.error(`Vector search failed: ${msg}`, stack);
      }
    }

    // Fallback: If no vector results, perform case-insensitive text match in DB
    if (retrievedChunks.length === 0) {
      const dbChunks = await this.prisma.chunk.findMany({
        where: {
          document: { agentId },
          content: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        include: { document: true },
      });

      retrievedChunks = dbChunks.map((c) => ({
        content: c.content,
        documentName: c.document.filename,
        score: 1.0, // mock score for keyword match
      }));
    }

    // Generate response using Gemini if key is present
    let responseText = '';
    if (process.env.GEMINI_API_KEY && retrievedChunks.length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const contextText = retrievedChunks
          .map((c) => `[Source: ${c.documentName}]\n${c.content}`)
          .join('\n\n');

        const prompt = `You are a helpful customer support agent. Answer the user's question politely and accurately, based ONLY on the provided context below. If the answer cannot be determined from the context, follow this instruction: "${agent.systemPrompt || 'Please tell the user to email support.'}".

System Prompt / Personality:
${agent.systemPrompt}

Welcome Message:
${agent.welcomeMessage}

Context:
${contextText}

User Query:
${query}

Response:`;

        const result = await model.generateContent(prompt);
        responseText = result.response.text().trim();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const stack = (err instanceof Error ? err.stack : '') || '';
        this.logger.error(`Gemini generation failed: ${msg}`, stack);
      }
    }

    // Secondary simulated fallback response if Gemini generation failed or skipped
    if (!responseText) {
      if (retrievedChunks.length > 0) {
        responseText = `[Simulated RAG Response] Hello! Based on the documents for ${agent.name}:\n\n`;
        responseText += retrievedChunks.map((c) => `• ${c.content} (Source: ${c.documentName})`).join('\n\n');
        responseText += `\n\nIs there anything else I can assist you with?`;
      } else {
        responseText = agent.welcomeMessage || `I'm sorry, I couldn't find any relevant information in my database. Please contact our support team.`;
      }
    }

    return {
      query,
      retrievedChunks,
      response: responseText,
    };
  }
}
