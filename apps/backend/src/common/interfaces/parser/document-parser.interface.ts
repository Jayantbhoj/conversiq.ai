import { ParsedDocument } from './parsed-document.interface';

export interface DocumentParser {
  parse(fileBuffer: Buffer): Promise<ParsedDocument>;
}
