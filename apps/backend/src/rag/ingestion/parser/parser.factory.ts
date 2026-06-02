import { BadRequestException, Injectable } from "@nestjs/common";
import { DocumentParser } from "./interfaces/document-parser.interface";
import { PdfParser } from "./pdf.parser";
import { TxtParser } from "./txt.parser";
import { MarkdownParser } from "./markdown.parser";

@Injectable()
export class ParserFactory {
  constructor(
    private readonly pdfParser: PdfParser,
    private readonly txtParser: TxtParser,
    private readonly markdownParser: MarkdownParser,
  ) {}

  getParser(mimeType: string): DocumentParser {
    switch (mimeType) {
      case 'application/pdf':
        return this.pdfParser;

      case 'text/plain':
        return this.txtParser;

      case 'text/markdown':
        return this.markdownParser;

      default:
        throw new BadRequestException(
          `Unsupported mime type: ${mimeType}`,
        );
    }
  }
}