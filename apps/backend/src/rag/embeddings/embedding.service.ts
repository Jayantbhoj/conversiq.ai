import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/common/logger/logger.service';

import { GeminiEmbeddingProvider } from './providers/gemini-embedding.provider';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly provider:
      GeminiEmbeddingProvider,

    private readonly logger:
      LoggerService,
  ) {}

  async generateEmbedding(
    text: string,
  ): Promise<number[]> {
    const embedding =
      await this.provider.generateEmbedding(
        text,
      );

    this.logger.log(
      `Generated embedding. Dimensions=${embedding.length}`,
    );

    return embedding;
  }
}