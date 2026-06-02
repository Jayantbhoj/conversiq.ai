import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentSwaggerDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file!: any;

  @ApiProperty({
    required: false,
    type: String,
    example: 'refund,policy',
  })
  tags?: string;
}