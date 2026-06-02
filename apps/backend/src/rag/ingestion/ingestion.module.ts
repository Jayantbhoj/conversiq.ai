import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { DocumentsModule } from '@/api/documents/documents.module';
import { PrismaModule } from '@/database/prisma.module';
import { StorageModule } from '@/api/documents/storage/storage.module';

import { DocumentIngestionService } from './ingestion.service';

import { ParserFactory } from './parser/parser.factory';
import { PdfParser } from './parser/pdf.parser';
import { TxtParser } from './parser/txt.parser';
import { MarkdownParser } from './parser/markdown.parser';

import { ChunkingHelper } from './chunks/chunking.helper';
import { ChunkService } from './chunks/chunking.service';
import { IngestionProducer } from './ingestion.producer';
import { IngestionProcessor } from './ingestion.processor';


@Module({
  imports: [
    forwardRef(() => DocumentsModule),
    PrismaModule,
    StorageModule,

    BullModule.registerQueue({
      name: 'document-ingestion',
    }),
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
  ],

  exports: [
    DocumentIngestionService,
    IngestionProducer,
  ],
})
export class IngestionModule {}