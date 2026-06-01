import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMessageDto, MessageSender } from './dtos/create-message.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  findMessages(chatId: string) {
    return this.prisma.message.findMany({
      where: { chatSessionId: chatId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async addMessage(chatId: string, data: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        chatSessionId: chatId,
        sender: data.sender === MessageSender.AGENT ? 'agent' : 'customer',
        content: data.content
      }
    });

    await this.prisma.chatSession.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  updateRating(chatId: string, rating: number) {
    return this.prisma.chatSession.update({
      where: { id: chatId },
      data: { rating }
    });
  }
}
