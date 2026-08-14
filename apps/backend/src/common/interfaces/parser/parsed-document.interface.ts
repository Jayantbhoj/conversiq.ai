export interface ParsedDocument {
  text: string;
  metadata?: {
    pageCount?: number;
    
    characterCount?: number;
  };
}