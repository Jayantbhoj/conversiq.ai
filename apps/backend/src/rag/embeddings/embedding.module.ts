import { Module } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';
import { GeminiEmbeddingProvider } from './providers/gemini-embedding.provider';
import { EmbeddingController } from './embedding.controller';

@Module({
  providers: [
    EmbeddingService,
    GeminiEmbeddingProvider,
  ],
  controllers: [
    EmbeddingController,
  ],

  exports: [
    EmbeddingService,
  ],
})
export class EmbeddingModule {}