import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { LoggerService } from '@/common/logger/logger.service';
import { CHUNKING_CONFIG } from '@/common/consts/chunking.consts';

import {
  ChildChunkResult,
  ChunkingResult,
  ParentChunkResult,
} from '../../../common/interfaces/chunks/chunk-result.interface';

@Injectable()
export class ChunkingHelper {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  chunk(text: string): ChunkingResult {
    if (!text?.trim()) {
      throw new BadRequestException(
        'Cannot chunk empty text',
      );
    }

    const normalizedText =
      this.normalizeText(text);

    const parents =
      this.createParentChunks(
        normalizedText,
      );

    const children =
      this.createChildChunks(
        parents,
      );

    this.logger.log(
      [
        'Chunking completed.',
        `Characters=${normalizedText.length}`,
        `Parents=${parents.length}`,
        `Children=${children.length}`,
      ].join(' '),
    );

    return {
      parents,
      children,
    };
  }

  private createParentChunks(
    text: string,
  ): ParentChunkResult[] {
    const parents: ParentChunkResult[] = [];

    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      const end = Math.min(
        start + CHUNKING_CONFIG.parent.size,
        text.length,
      );

      const content = text
        .slice(start, end)
        .trim();

      if (content.length > 0) {
        parents.push({
          chunkIndex,
          content,

          metadata: {
            chunkType: 'PARENT',

            startOffset: start,
            endOffset: end,

            characterCount:
              content.length,
          },
        });

        chunkIndex++;
      }

      start +=
        CHUNKING_CONFIG.parent.size -
        CHUNKING_CONFIG.parent.overlap;
    }

    return parents;
  }

  private createChildChunks(
    parents: ParentChunkResult[],
  ): ChildChunkResult[] {
    const children: ChildChunkResult[] = [];

    let childIndex = 0;

    for (const parent of parents) {
      let start = 0;

      while (
        start < parent.content.length
      ) {
        const end = Math.min(
          start + CHUNKING_CONFIG.child.size,
          parent.content.length,
        );

        const content = parent.content
          .slice(start, end)
          .trim();

        if (content.length > 0) {
          children.push({
            chunkIndex: childIndex,

            parentIndex:
              parent.chunkIndex,

            content,

            metadata: {
              chunkType: 'CHILD',

              parentIndex:
                parent.chunkIndex,

              startOffset: start,
              endOffset: end,

              characterCount:
                content.length,
            },
          });

          childIndex++;
        }

        start +=
          CHUNKING_CONFIG.child.size -
          CHUNKING_CONFIG.child.overlap;
      }
    }

    return children;
  }

  private normalizeText(
    text: string,
  ): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }
}