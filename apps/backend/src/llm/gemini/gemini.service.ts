import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ZodSchema } from 'zod';

import { GeminiModels } from '@/common/consts/gemini/gemini-model.const';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  private readonly client: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schema: ZodSchema<T>,
    model: string = GeminiModels.CHAT,
  ): Promise<T> {
    try {
      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      if (!response.text) {
        throw new Error('Gemini returned an empty response');
      }

      const json = JSON.parse(response.text);

      return schema.parse(json);
    } catch (error) {
      this.logger.error(
        'Failed to generate structured output',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to generate structured output',
      );
    }
  }

  async generateText(
    prompt: string,
    model: string = GeminiModels.CHAT,
  ): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text ?? '';
    } catch (error) {
      this.logger.error(
        'Failed to generate text',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to generate Gemini response',
      );
    }
  }

  async generateEmbedding(
    text: string,
    model: string = GeminiModels.EMBEDDING,
  ): Promise<number[]> {
    try {
      const response = await this.client.models.embedContent({
        model,
        contents: text,
      });

      const embedding = response.embeddings?.[0]?.values;

      if (!embedding) {
        throw new Error('Embedding not found in Gemini response');
      }

      return embedding;
    } catch (error) {
      this.logger.error(
        'Failed to generate embedding',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to generate embedding',
      );
    }
  }
}