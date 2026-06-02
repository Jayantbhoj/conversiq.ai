import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':id/messages')
  getMessages(@Param('id') chatId: string) {
    return this.chatsService.findMessages(chatId);
  }

  @Post(':id/messages')
  addMessage(@Param('id') chatId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.chatsService.addMessage(chatId, createMessageDto);
  }

  @Post(':id/rating')
  updateRating(@Param('id') chatId: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.chatsService.updateRating(chatId, updateRatingDto.rating);
  }
}
