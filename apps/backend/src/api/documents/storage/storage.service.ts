import {
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { r2Client } from './r2.client';

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
}