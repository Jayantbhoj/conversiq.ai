import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../../api/documents/storage/storage.service';
import { LoggerService } from '@/common/logger/logger.service';
import { ParserFactory } from './parser/parser.factory';
import { ChunkingHelper } from './chunks/chunking.helper';
import { ChunkService } from './chunks/chunking.service';
import { PrismaService } from '@/database/prisma.service';
import { EmbeddingProducer } from './queues/producers/embedding.producer';

@Injectable()
export class DocumentIngestionService {
  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly chunkingHelper: ChunkingHelper,
    private readonly chunkService: ChunkService,
    private readonly embeddingProducer: EmbeddingProducer,
    private readonly logger: LoggerService,
  ) {}

  async ingest(documentId: string) {
    this.logger.log(
      `Starting ingestion for document ${documentId}`,
    );

    try {
      const document =
        await this.prisma.document.findUnique({
            where: {
            id: documentId,
            },
        });

        if (!document) {
        throw new NotFoundException(
            `Document ${documentId} not found`,
        );
        }

      const fileBuffer =
        await this.storageService.getFileBuffer(
          document.r2Key,
        );

      this.logger.log(
        `Downloaded file from storage. DocumentId=${document.id}`,
      );

      const parser =
        this.parserFactory.getParser(
          document.mimeType,
        );

      const parsedDocument =
        await parser.parse(fileBuffer);

      this.logger.log(
        [
          'Document parsed.',
          `DocumentId=${document.id}`,
          `Characters=${parsedDocument.text.length}`,
        ].join(' '),
      );

      const chunkResult =
        this.chunkingHelper.chunk(
          parsedDocument.text,
        );

      this.logger.log(
        [
          'Chunking completed.',
          `DocumentId=${document.id}`,
          `Parents=${chunkResult.parents.length}`,
          `Children=${chunkResult.children.length}`,
        ].join(' '),
      );

      const parentChunks =
        await this.chunkService.createParents(
          document.id,
          chunkResult.parents,
        );

      await this.chunkService.createChildren(
        document.id,
        parentChunks,
        chunkResult.children,
      );

      await this.embeddingProducer.enqueueDocument(
        document.id,
      );

      const totalChunkCount =
        parentChunks.length +
        chunkResult.children.length;

      await this.prisma.document.update({
        where: {
            id: document.id,
        },
        data: {
            chunkCount: totalChunkCount,
            status: 'PROCESSING',
            processingError: null,
        },
      });

      this.logger.log(
        [
          'Document ingestion completed.',
          `DocumentId=${document.id}`,
          `Parents=${chunkResult.parents.length}`,
          `Children=${chunkResult.children.length}`,
        ].join(' '),
      );

      return {
        documentId: document.id,
        parentChunkCount:
          chunkResult.parents.length,
        childChunkCount:
          chunkResult.children.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown ingestion error';

      const trace =
        error instanceof Error
          ? error.stack ?? error.message
          : String(error);

      this.logger.error(
        `Document ingestion failed. DocumentId=${documentId}`,
        trace,
      );

      try {
        await this.prisma.document.update({
            where: {
                id: documentId,
            },
            data: {
                status: 'FAILED',
                processingError: errorMessage,
            },
        });
      } catch {
        this.logger.error(
          `Failed to update failed status for document ${documentId}`,
          '',
        );
      }

      throw error;
    }
  }
}