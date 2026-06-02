import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { LoggerService } from '@/common/logger/logger.service';
import { ChildChunkResult, ParentChunkResult } from './interfaces/chunk-result.interface';



@Injectable()
export class ChunkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async createParents(
    documentId: string,
    parents: ParentChunkResult[],
  ) {
    try {
      const createdParents = [];

      for (const parent of parents) {
        const chunk =
          await this.prisma.chunk.create({
            data: {
              documentId,

              chunkIndex:
                parent.chunkIndex,

              content:
                parent.content,

              metadata:
                parent.metadata,
            },
          });

        createdParents.push(chunk);
      }

      this.logger.log(
        `Created ${createdParents.length} parent chunks for document ${documentId}`,
      );

      return createdParents;
    } catch (error) {
      this.logger.error(
        'Failed to create parent chunks',
        error instanceof Error
          ? error.stack ?? error.message
          : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to create parent chunks',
      );
    }
  }

  async createChildren(
    documentId: string,
    parentChunks: {
      id: string;
      chunkIndex: number;
    }[],
    children: ChildChunkResult[],
  ) {
    try {
      const parentMap = new Map(
        parentChunks.map((parent) => [
          parent.chunkIndex,
          parent.id,
        ]),
      );

      await this.prisma.chunk.createMany({
        data: children.map((child) => ({
          documentId,

          parentId:
            parentMap.get(
              child.parentIndex,
            ),

          chunkIndex:
            child.chunkIndex,

          content:
            child.content,

          metadata:
            child.metadata,
        })),
      });

      this.logger.log(
        `Created ${children.length} child chunks for document ${documentId}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to create child chunks',
        error instanceof Error
          ? error.stack ?? error.message
          : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to create child chunks',
      );
    }
  }

  async deleteByDocumentId(
    documentId: string,
  ): Promise<void> {
    try {
      await this.prisma.chunk.deleteMany({
        where: {
          documentId,
        },
      });

      this.logger.log(
        `Deleted chunks for document ${documentId}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete chunks',
        error instanceof Error
          ? error.stack ?? error.message
          : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to delete chunks',
      );
    }
  }
}