export interface EmbeddingProvider {
  generateEmbedding(
    text: string,
  ): Promise<number[]>;
}
//prevents gemini from leaking throughout the codebase