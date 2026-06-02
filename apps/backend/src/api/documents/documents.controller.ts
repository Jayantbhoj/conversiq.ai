import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { LoggerService } from '../../common/logger/logger.service';
import { UploadDocumentRequestDto } from './dtos/uploadDocumentRequest.dto';
import { UploadDocumentResponseDto } from './dtos/uploadDocumentResponse.dto';
import { MapperUtil } from '../../common/mappers/mapper.util';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadDocumentSwaggerDto } from './dtos/uploadDocumentSwagger.dto';



@ApiTags('Documents')
@Controller('agents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: 'Upload a document',
    description:
      'Uploads a document to R2 and creates a document record.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  type: UploadDocumentSwaggerDto,
})
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: UploadDocumentResponseDto,
  })
  @Post(':agentId/documents')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadDocument(
    @Param('agentId') agentId: string,

    @Body()
    body: UploadDocumentRequestDto,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType:
              /(pdf|txt|md|csv)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadDocumentResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    this.logger.log('Document upload requested');
    const tags =
      body.tags
        ?.split(',')
        .map(tag => tag.trim())
        .filter(Boolean) ?? [];

    const document =
      await this.documentsService.uploadDocument({
        agentId,
        file,
        tags: tags,
      });

    this.logger.log('Document uploaded successfully');

    return MapperUtil.toDto(
      UploadDocumentResponseDto,
      document,
    );
  }
}