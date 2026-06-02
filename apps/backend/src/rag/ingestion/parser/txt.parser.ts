import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { LoggerService } from '@/common/logger/logger.service';

import { DocumentParser } from './interfaces/document-parser.interface';
import { ParsedDocument } from './interfaces/parsed-document.interface';

@Injectable()
export class TxtParser implements DocumentParser {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  async parse(
    fileBuffer: Buffer,
  ): Promise<ParsedDocument> {
    if (!fileBuffer?.length) {
      throw new BadRequestException(
        'TXT file is empty',
      );
    }

    try {
      const text = fileBuffer
        .toString('utf-8')
        .trim();

      if (!text) {
        throw new BadRequestException(
          'No text could be extracted from TXT file',
        );
      }

      this.logger.log(
        `Successfully parsed TXT file. Characters=${text.length}`,
      );

      return {
        text,
        metadata: {
          characterCount:
            text.length,
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to parse TXT document',
        error instanceof Error
          ? error.stack ?? error.message
          : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to parse TXT document',
      );
    }
  }
}