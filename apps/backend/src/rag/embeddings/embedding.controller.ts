// src/rag/embeddings/embedding.controller.ts

import { Controller, Get } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';

@Controller('embeddings')
export class EmbeddingController {
  constructor(
    private readonly embeddingService: EmbeddingService,
  ) {}

  @Get('test')
  async test() {
    const embedding =
      await this.embeddingService.generateEmbedding(
        'What is your refund policy?',
      );

    return {
      dimensions: embedding.length,
      firstFive: embedding.slice(0, 5),
    };
  }
}