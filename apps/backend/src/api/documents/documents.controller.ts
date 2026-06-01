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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { LoggerService } from '../../common/logger/logger.service';
import { UploadDocumentRequestDto } from './dtos/uploadDocumentRequest.dto';
import { UploadDocumentResponseDto } from './dtos/uploadDocumentResponse.dto';
import { MapperUtil } from '../../common/mappers/mapper.util';




@Controller('agents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly logger: LoggerService,
  ) {}

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

    const document =
      await this.documentsService.uploadDocument({
        agentId,
        file,
        tags: body.tags ?? [],
      });

    this.logger.log('Document uploaded successfully');

    return MapperUtil.toDto(
      UploadDocumentResponseDto,
      document,
    );
  }
}