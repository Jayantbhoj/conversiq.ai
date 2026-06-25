import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { DocumentIngestionService } from '../../ingestion.service';
import { LoggerService } from '@/common/logger/logger.service';

@Processor('document-ingestion')
export class IngestionProcessor
  extends WorkerHost
{
  constructor(
    private readonly ingestionService: DocumentIngestionService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(
    job: Job<{ documentId: string }>,
  ) {
    this.logger.log(
      `Processing ingestion for ${job.data.documentId}`,
    );
    await this.ingestionService.ingest(
      job.data.documentId,
    );
  }
}