import { LoggerService } from "@/common/logger/logger.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class EmbeddingProducer {
  constructor(
    @InjectQueue('embedding')
    private readonly queue: Queue,
    private readonly logger: LoggerService,
  ) {}

  async enqueueDocument(
    documentId: string,
  ) {
    this.logger.log(
      `Queued embeddings for ${documentId}`,
    );
    await this.queue.add(
      'embed-document',
      {
        documentId,
      },
      {
        jobId: documentId,
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }
}