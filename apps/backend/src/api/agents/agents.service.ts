import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { CreateKnowledgeDto } from './dtos/create-knowledge.dto';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.agent.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.agent.findUnique({
      where: { id },
      include: {
        knowledge: true,
        chats: true
      }
    });
  }

  create(data: CreateAgentDto) {
    return this.prisma.agent.create({
      data: {
        name: data.name,
        welcomeMessage: data.welcomeMessage,
        systemPrompt: data.systemPrompt,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        avatarUrl: data.avatarUrl
      }
    });
  }

  update(id: string, data: UpdateAgentDto) {
    return this.prisma.agent.update({
      where: { id },
      data
    });
  }

  remove(id: string) {
    return this.prisma.agent.delete({
      where: { id }
    });
  }

  findKnowledge(agentId: string) {
    return this.prisma.knowledgeSource.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  addKnowledge(agentId: string, data: CreateKnowledgeDto) {
    return this.prisma.knowledgeSource.create({
      data: {
        agentId,
        title: data.title,
        content: data.content
      }
    });
  }

  removeKnowledge(agentId: string, knowledgeId: string) {
    return this.prisma.knowledgeSource.deleteMany({
      where: {
        id: knowledgeId,
        agentId
      }
    });
  }

  findChats(agentId: string) {
    return this.prisma.chatSession.findMany({
      where: { agentId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  createChat(agentId: string) {
    return this.prisma.chatSession.create({
      data: {
        agentId,
        category: 'UNCLASSIFIED'
      }
    });
  }
}
