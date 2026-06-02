import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { DocumentIngestionService } from './ingestion.service';

@Processor('document-ingestion')
export class IngestionProcessor
  extends WorkerHost
{
  constructor(
    private readonly ingestionService:
      DocumentIngestionService,
  ) {
    super();
  }

  async process(
    job: Job<{ documentId: string }>,
  ) {
    await this.ingestionService.ingest(
      job.data.documentId,
    );
  }
}