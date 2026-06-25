import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/common/logger/logger.service';

import { GeminiEmbeddingProvider } from './providers/gemini-embedding.provider';
import { PrismaService } from '@/database/prisma.service';
import { QdrantService } from './qdrant/qdrant.service';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly provider:
      GeminiEmbeddingProvider,
    private readonly prisma:
      PrismaService,
    private readonly qdrantService:
      QdrantService,
    private readonly logger:
      LoggerService,
  ) {}

  async generateEmbedding(
    text: string,
  ): Promise<number[]> {
    const embedding =
      await this.provider.generateEmbedding(
        text,
      );

    this.logger.log(
      `Generated embedding. Dimensions=${embedding.length}`,
    );

    return embedding;
  }

  async embedDocument(
    documentId: string,
  ): Promise<void> {
    this.logger.log(
      `Starting embeddings for document ${documentId}`,
    );

    const document =
      await this.prisma.document.findUnique({
        where: {
          id: documentId,
        },
        include: {
          agent: {
            select: {
              id: true,
              businessId: true,
            },
          },
        },
      });

    if (!document) {
      this.logger.warn(
        `Document not found for embedding: ${documentId}`,
      );

      return;
    }

    const chunks =
      await this.prisma.chunk.findMany({
        where: {
          documentId,

          // child chunks only
          parentId: {
            not: null,
          },
        },

        orderBy: {
          chunkIndex: 'asc',
        },
      });

    if (!chunks.length) {
      this.logger.warn(
        `No child chunks found for document ${documentId}`,
      );

      return;
    }

    for (const chunk of chunks) {
      const embedding =
        await this.generateEmbedding(
          chunk.content,
        );

      await this.qdrantService.upsertPoint(
        chunk.id,
        embedding,
        {
          businessId:
            document.agent.businessId,
          agentId:
            document.agent.id,
          documentId:
            chunk.documentId,
          chunkId:
            chunk.id,
          parentId:
            chunk.parentId,
          chunkIndex:
            chunk.chunkIndex,
        },
      );
    }

    this.logger.log(
      `Embedded ${chunks.length} chunks for document ${documentId}`,
    );
  }
}