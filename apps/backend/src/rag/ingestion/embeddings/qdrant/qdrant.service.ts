import {
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { createHash } from 'crypto';

import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class QdrantService
  implements OnModuleInit
{
  private readonly client: QdrantClient;

  private readonly collectionName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.collectionName =
      this.configService.getOrThrow<string>(
        'QDRANT_COLLECTION',
      );

    this.client = new QdrantClient({
      host: this.configService.getOrThrow<string>(
        'QDRANT_HOST',
      ),

      port: Number(
        this.configService.get(
          'QDRANT_PORT',
          6333,
        ),
      ),
    });
  }

  async onModuleInit() {
    this.logger.log(
      'Initializing Qdrant',
    );

    await this.createCollection();
  }

  private async createCollection() {
    const vectorSize = Number(
      this.configService.getOrThrow(
        'QDRANT_VECTOR_SIZE',
      ),
    );

    const collections =
      await this.client.getCollections();

    const exists =
      collections.collections.some(
        (collection) =>
          collection.name ===
          this.collectionName,
      );

    if (exists) {
      const collection = await this.client.getCollection(
        this.collectionName,
      );

      const existingSize =
        (collection as any).vectors?.size ??
        (collection as any).vector?.size ??
        null;

      if (
        existingSize !== null &&
        existingSize !== vectorSize
      ) {
        throw new Error(
          `Qdrant collection ${this.collectionName} already exists with vector size ${existingSize}, but QDRANT_VECTOR_SIZE is ${vectorSize}. Please recreate the collection with the correct vector size or update the environment variable.`,
        );
      }

      this.logger.log(
        `Qdrant collection ${this.collectionName} already exists`,
      );

      return;
    }

    await this.client.createCollection(
      this.collectionName,
      {
        vectors: {
          size: vectorSize,
          distance: 'Cosine',
        },
      },
    );

    this.logger.log(
      `Created Qdrant collection ${this.collectionName}`,
    );
  }

  async upsertPoint(
    pointId: string,
    vector: number[],
    payload: Record<
      string,
      unknown
    >,
  ) {
    const qdrantPointId =
      this.normalizePointId(pointId);

    this.logger.log(
      `Upserting vector. ChunkId=${pointId} QdrantId=${qdrantPointId} Dimensions=${vector.length}`,
    );
    await this.client.upsert(
      this.collectionName,
      {
        wait: true,

        points: [
          {
            id: qdrantPointId,
            vector,
            payload,
          },
        ],
      },
    );
  }

  private normalizePointId(
    pointId: string,
  ): string | number {
    if (/^\d+$/.test(pointId)) {
      return Number(pointId);
    }

    if (this.isUuid(pointId)) {
      return pointId;
    }

    return this.toUuid(pointId);
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private toUuid(value: string): string {
    const hash = createHash('sha1')
      .update(value)
      .digest('hex');

    const timeLow = hash.slice(0, 8);
    const timeMid = hash.slice(8, 12);
    const timeHiAndVersion = (
      (parseInt(hash.slice(12, 16), 16) & 0x0fff) |
      0x5000
    )
      .toString(16)
      .padStart(4, '0');
    const clockSeq = (
      (parseInt(hash.slice(16, 18), 16) & 0x3f) |
      0x80
    )
      .toString(16)
      .padStart(2, '0');
    const clockSeqLow = hash.slice(18, 20);
    const node = hash.slice(20, 32);

    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}${clockSeqLow}-${node}`;
  }
  //production use batch upsert
  async upsertPoints(
    points: {
      id: string;
      vector: number[];
      payload: Record<string, unknown>;
    }[],
  ) {
    await this.client.upsert(
      this.collectionName,
      {
        wait: true,
        points,
      },
    );
  }

  async search(
    vector: number[],
    businessId: string,
    limit = 5,
    documentId?: string,
    agentId?: string,
  ) {
    const filter = {
      must: [
        {
          key: 'businessId',
          match: {
            value: businessId,
          },
        },
      ] as Array<Record<string, unknown>>,
    };

    if (documentId) {
      filter.must.push({
        key: 'documentId',
        match: {
          value: documentId,
        },
      });
    }

    if (agentId) {
      filter.must.push({
        key: 'agentId',
        match: {
          value: agentId,
        },
      });
    }

    return this.client.search(
      this.collectionName,
      {
        vector,
        limit,
        filter,
        with_payload: true,
      },
    );
  }

  async deletePoint(
    pointId: string,
  ) {
    await this.client.delete(
      this.collectionName,
      {
        points: [pointId],
      },
    );
  }

  async deleteByDocumentId(
    documentId: string,
  ) {
    await this.client.delete(
      this.collectionName,
      {
        filter: {
          must: [
            {
              key: 'documentId',
              match: {
                value: documentId,
              },
            },
          ],
        },
      },
    );
  }

  async getCollectionInfo() {
    return this.client.getCollection(
      this.collectionName,
    );
  }

  getClient(): QdrantClient {
    return this.client;
  }
}