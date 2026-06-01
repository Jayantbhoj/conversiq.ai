import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from './storage/storage.service';
import { UploadDocumentInput } from 'src/common/interfaces/upload-document-input.interface';


@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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

    try {
      document = await this.prisma.document.create({
        data: {
          agentId,

          filename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,

          r2Key: '',

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

      await this.prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          status: 'PROCESSING',
        },
      });


      const updatedDocument =
        await this.prisma.document.update({
          where: {
            id: document.id,
          },
          data: {
            status: 'COMPLETED',

            // content,
          },
        });

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
}