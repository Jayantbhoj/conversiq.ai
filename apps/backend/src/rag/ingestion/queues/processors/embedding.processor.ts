import { Processor, WorkerHost } from "@nestjs/bullmq";
import { EmbeddingService } from "../../embeddings/embedding.service";
import { Job } from "bullmq";
import { LoggerService } from "@/common/logger/logger.service";

@Processor('embedding')
export class EmbeddingProcessor
  extends WorkerHost
{
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(
    job: Job<{
      documentId: string;
    }>,
  ): Promise<void> {
    this.logger.log(
      `Processing embeddings for ${job.data.documentId}`,
    );

    try {
      switch (job.name) {
        case 'embed-document':
          await this.embeddingService.embedDocument(
            job.data.documentId,
          );
          break;
      }
    } catch (error) {
      this.logger.error(
        `Embedding job failed for ${job.data.documentId}`,
        error instanceof Error
          ? error.stack ?? error.message
          : String(error),
      );
      throw error;
    }
  }
}