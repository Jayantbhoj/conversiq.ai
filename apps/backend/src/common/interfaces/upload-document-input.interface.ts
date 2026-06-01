export interface UploadDocumentInput {
  agentId: string;
  file: Express.Multer.File;
  tags: string[];
}