import { Module } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';
import { GeminiEmbeddingProvider } from './providers/gemini-embedding.provider';
import { EmbeddingController } from './embedding.controller';
import { QdrantService } from './qdrant/qdrant.service';

@Module({
  providers: [
    EmbeddingService,
    GeminiEmbeddingProvider,
    QdrantService,
  ],
  controllers: [
    EmbeddingController,
  ],

  exports: [
    EmbeddingService,
  ],
})
export class EmbeddingModule {}