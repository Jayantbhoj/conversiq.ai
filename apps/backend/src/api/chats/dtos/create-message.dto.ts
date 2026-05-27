import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum MessageSender {
  CUSTOMER = 'customer',
  AGENT = 'agent'
}

export class CreateMessageDto {
  @IsEnum(MessageSender)
  sender!: MessageSender;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
