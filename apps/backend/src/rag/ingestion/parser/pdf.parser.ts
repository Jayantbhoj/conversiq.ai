import pdfParse from 'pdf-parse';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { LoggerService } from '@/common/logger/logger.service';

import { DocumentParser } from './interfaces/document-parser.interface';
import { ParsedDocument } from './interfaces/parsed-document.interface';

@Injectable()
export class PdfParser implements DocumentParser {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  async parse(fileBuffer: Buffer): Promise<ParsedDocument> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('PDF file is empty');
    }

    try {
      const pdf = await pdfParse(fileBuffer);

      const text = this.normalizeText(pdf.text);

      if (!text) {
        throw new BadRequestException(
          'No text could be extracted from the PDF',
        );
      }

      this.logger.log(
        `Successfully parsed PDF. Pages=${pdf.numpages}, Characters=${text.length}`,
      );

      return {
        text,
        metadata: {
          pageCount: pdf.numpages,
          characterCount: text.length,
        },
      };
    } catch (error) {
        const trace =
        error instanceof Error
            ? error.stack ?? error.message
            : String(error);

        this.logger.error(
        'Failed to parse PDF document',
        trace,
        );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to parse PDF document',
      );
    }
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }
}