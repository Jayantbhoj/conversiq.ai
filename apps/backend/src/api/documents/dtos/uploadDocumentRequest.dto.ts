import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UploadDocumentRequestDto {
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string;
}