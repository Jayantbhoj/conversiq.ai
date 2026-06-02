import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from './storage/storage.service';
import { UploadDocumentInput } from '@/common/interfaces/upload-document-input.interface';
import { Document } from '@prisma/client';
import * as path from 'path';
import { IngestionProducer } from '@/rag/ingestion/ingestion.producer';



@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly ingestionProducer: IngestionProducer,

  ) {}

  async findById(documentId: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new NotFoundException(
        `Document ${documentId} not found`,
      );
    }

    return document;
  }

  async uploadDocument(input: UploadDocumentInput) {
    const { agentId, file, tags } = input;
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        businessId: true,
      },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent ${agentId} not found`,
      );
    }

    let document;
    const extension = path
      .extname(file.originalname)
      .replace('.', '')
      .toLowerCase();
    
    try {
      document = await this.prisma.document.create({
        data: {
          agentId,

          filename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,

          r2Key: '',
          tags, 
          metadata: {
            source: 'upload',
            extension: extension
          },

          status: 'PENDING',
        },
      });

      const r2Key = [
        agent.businessId,
        agent.id,
        document.id,
      ].join('/');

      await this.prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          status: 'UPLOADING',
          r2Key,
        },
      });

      await this.storageService.upload(
        r2Key,
        file,
      );

      const updatedDocument = await this.prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          status: 'PROCESSING',
        },
      });
      
      await this.ingestionProducer.enqueueDocument(
        document.id,
      );

      return updatedDocument;

    } catch (error) {
      if (document) {
        await this.prisma.document.update({
          where: {
            id: document.id,
          },
          data: {
            status: 'FAILED',
            processingError:
              error instanceof Error
                ? error.message
                : 'Unknown error',
          },
        });
      }

      throw new InternalServerErrorException(
        'Document upload failed',
      );
    }
  }
  
  async updateChunkCount(
    documentId: string,
    chunkCount: number,
  ) {
    return this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        chunkCount,
      },
    });
  }

  async markCompleted(
    documentId: string,
  ) {
    return this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        status: 'COMPLETED',
        processingError: null,
      },
    });
  }

  async markFailed(
    documentId: string,
    error: string,
  ) {
    return this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        status: 'FAILED',
        processingError: error,
      },
    });
  }

}