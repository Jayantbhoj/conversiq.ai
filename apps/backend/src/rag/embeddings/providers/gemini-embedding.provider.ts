import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { EmbeddingProvider } from './embedding-provider.interface';

@Injectable()
export class GeminiEmbeddingProvider
  implements EmbeddingProvider
{
  private readonly model;

  constructor() {
    const genAI =
      new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY!,
      );

    this.model =
      genAI.getGenerativeModel({
        model: 'gemini-embedding-001',
      });
  }

  async generateEmbedding(
    text: string,
  ): Promise<number[]> {
    const result =
      await this.model.embedContent(
        text,
      );

    return result.embedding.values;
  }
}