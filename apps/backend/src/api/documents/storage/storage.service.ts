import {
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { r2Client } from './r2.client';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  async upload(
    key: string,
    file: Express.Multer.File,
  ) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,

        Body: file.buffer,

        ContentType: file.mimetype,
      }),
    );
  }

  async getFileBuffer(
    key: string,
  ): Promise<Buffer> {
    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(
        `File not found in R2: ${key}`,
      );
    }

    return this.streamToBuffer(
      response.Body as Readable,
    );
  }

  private async streamToBuffer(
    stream: Readable,
  ): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk),
      );
    }

    return Buffer.concat(chunks);
  }
}