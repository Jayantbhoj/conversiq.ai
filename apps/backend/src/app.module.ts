import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './api/health/health.module';
import { PrismaModule } from './database/prisma.module';
import { ChatsModule } from './api/chats/chats.module';
import { AgentsModule } from './api/agents/agents.module';
import { DocumentsModule } from './api/documents/documents.module';
import { StorageModule } from './api/documents/storage/storage.module';
import { BullModule } from '@nestjs/bullmq';


@Module({
  imports: [LoggerModule, HealthModule, PrismaModule, AgentsModule, ChatsModule, DocumentsModule, StorageModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
