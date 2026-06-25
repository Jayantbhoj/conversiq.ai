import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class IngestionProducer {
  constructor(
    @InjectQueue('document-ingestion')
    private readonly queue: Queue,
    private readonly logger: LoggerService,
  ) {}

  async enqueueDocument(
    documentId: string,
  ) {
    this.logger.log(
      `Queued ingestion for ${documentId}`,
    );
    await this.queue.add(
      'ingest-document',
      {
        documentId,
      },
      {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        
        removeOnComplete: 100,

        removeOnFail: 100,
      },
    );
  }
}