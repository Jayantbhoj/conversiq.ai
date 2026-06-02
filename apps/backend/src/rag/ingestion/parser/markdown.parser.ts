import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { LoggerService } from '@/common/logger/logger.service';

import { DocumentParser } from './interfaces/document-parser.interface';
import { ParsedDocument } from './interfaces/parsed-document.interface';

@Injectable()
export class MarkdownParser
  implements DocumentParser
{
  constructor(
    private readonly logger: LoggerService,
  ) {}

  async parse(
    fileBuffer: Buffer,
  ): Promise<ParsedDocument> {
    if (!fileBuffer?.length) {
      throw new BadRequestException(
        'Markdown file is empty',
      );
    }

    try {
      const text = fileBuffer
        .toString('utf-8')
        .trim();

      if (!text) {
        throw new BadRequestException(
          'No text could be extracted from markdown file',
        );
      }

      this.logger.log(
        `Successfully parsed markdown file. Characters=${text.length}`,
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
        'Failed to parse markdown document',
        error instanceof Error
          ? error.stack ?? error.message
          : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to parse markdown document',
      );
    }
  }
}