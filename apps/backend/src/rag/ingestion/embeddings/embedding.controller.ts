import { Controller, Get } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant/qdrant.service';

@Controller('embedding')
export class EmbeddingController {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {}

  @Get('test')
  async test() {
    const vector =
      await this.embeddingService
        .generateEmbedding(
          'hello world',
        );

    await this.qdrantService
      .getClient()
      .upsert(
        'chunks',
        {
          wait: true,
          points: [
            {
              id: 1,
              vector: [...vector],
              payload: {
                text: 'hello world',
              },
            },
          ],
        },
      );

    return {
      dimensions: vector.length,
    };
  }
}