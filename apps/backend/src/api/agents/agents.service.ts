import { Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
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
}
