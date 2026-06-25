import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { EmbeddingModule } from '../../rag/ingestion/embeddings/embedding.module';
import { QdrantModule } from '../../rag/ingestion/embeddings/qdrant/qdrant.module';

@Module({
  imports: [PrismaModule, EmbeddingModule, QdrantModule],
  controllers: [AgentsController],
  providers: [AgentsService]
})
export class AgentsModule {}
