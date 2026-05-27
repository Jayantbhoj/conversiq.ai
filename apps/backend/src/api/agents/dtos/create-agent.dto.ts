import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  welcomeMessage!: string;

  @IsString()
  @IsNotEmpty()
  systemPrompt!: string;

  @IsString()
  @IsNotEmpty()
  primaryColor!: string;

  @IsString()
  @IsNotEmpty()
  accentColor!: string;

  @IsUrl()
  avatarUrl!: string;
}
