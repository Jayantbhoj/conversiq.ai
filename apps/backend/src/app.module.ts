import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './api/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AgentsModule } from './agents/agents.module';
import { ChatsModule } from './api/chats/chats.module';

@Module({
  imports: [LoggerModule, HealthModule, PrismaModule, AgentsModule, ChatsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
