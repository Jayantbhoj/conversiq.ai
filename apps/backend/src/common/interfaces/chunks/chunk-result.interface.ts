export interface ParentChunkResult {
  chunkIndex: number;
  content: string;

  metadata: {
    chunkType: 'PARENT';

    startOffset: number;
    endOffset: number;

    characterCount: number;
  };
}

export interface ChildChunkResult {
  chunkIndex: number;

  parentIndex: number;

  content: string;

  metadata: {
    chunkType: 'CHILD';

    parentIndex: number;

    startOffset: number;
    endOffset: number;

    characterCount: number;
  };
}

export interface ChunkingResult {
  parents: ParentChunkResult[];
  children: ChildChunkResult[];
}