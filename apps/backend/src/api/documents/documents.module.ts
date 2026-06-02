import { Module, forwardRef } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { StorageModule } from "./storage/storage.module";
import { IngestionModule } from "@/rag/ingestion/ingestion.module";

@Module({
  imports: [StorageModule, forwardRef(() => IngestionModule)],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [
    DocumentsService,
  ],
})
export class DocumentsModule {}