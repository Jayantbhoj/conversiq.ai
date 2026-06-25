import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './api/health/health.module';
import { PrismaModule } from './database/prisma.module';
import { ChatsModule } from './api/chats/chats.module';
import { AgentsModule } from './api/agents/agents.module';
import { BusinessesModule } from './api/businesses/businesses.module';
import { DocumentsModule } from './api/documents/documents.module';
import { StorageModule } from './api/documents/storage/storage.module';
import { BullModule } from '@nestjs/bullmq';
import { EmbeddingModule } from './rag/ingestion/embeddings/embedding.module';
import { QdrantModule } from './rag/ingestion/embeddings/qdrant/qdrant.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [LoggerModule, HealthModule, PrismaModule, AgentsModule, BusinessesModule, ChatsModule, DocumentsModule, StorageModule, EmbeddingModule, QdrantModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
