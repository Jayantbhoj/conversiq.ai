import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { DocumentsModule } from '@/api/documents/documents.module';
import { PrismaModule } from '@/database/prisma.module';
import { StorageModule } from '@/api/documents/storage/storage.module';
import { EmbeddingModule } from './embeddings/embedding.module';

import { DocumentIngestionService } from './ingestion.service';

import { ParserFactory } from './parser/parser.factory';
import { PdfParser } from './parser/pdf.parser';
import { TxtParser } from './parser/txt.parser';
import { MarkdownParser } from './parser/markdown.parser';

import { ChunkingHelper } from './chunks/chunking.helper';
import { ChunkService } from './chunks/chunking.service';
import { IngestionProducer } from './queues/producers/ingestion.producer';
import { IngestionProcessor } from './queues/processors/ingestion.processor';
import { EmbeddingProducer } from './queues/producers/embedding.producer';
import { EmbeddingProcessor } from './queues/processors/embedding.processor';


@Module({
  imports: [
    forwardRef(() => DocumentsModule),
    PrismaModule,
    StorageModule,
    EmbeddingModule,

    BullModule.registerQueue(
      {
        name: 'document-ingestion',
      },
      {
        name: 'embedding'
      }
  ),
  ],

  providers: [
    DocumentIngestionService,
    ParserFactory,
    PdfParser,
    TxtParser,
    MarkdownParser,
    ChunkingHelper,
    ChunkService,
    IngestionProducer,
    IngestionProcessor,
    EmbeddingProducer,
    EmbeddingProcessor,
  ],

  exports: [
    DocumentIngestionService,
    IngestionProducer,
    EmbeddingProducer,
  ],
})
export class IngestionModule {}