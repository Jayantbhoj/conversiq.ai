import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionProducer {
  constructor(
    @InjectQueue('document-ingestion')
    private readonly queue: Queue,
  ) {}

  async enqueueDocument(
    documentId: string,
  ) {
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