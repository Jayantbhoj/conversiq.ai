import { Expose } from 'class-transformer';
import { DocumentStatus } from '@prisma/client';

export class UploadDocumentResponseDto {
  @Expose()
  id!: string;

  @Expose()
  filename!: string;

  @Expose()
  mimeType!: string;

  @Expose()
  fileSize!: number;

  @Expose()
  status!: DocumentStatus;

  @Expose()
  tags!: string[];

  @Expose()
  createdAt!: Date;
}