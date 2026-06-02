export const CHUNKING_CONFIG = {
  parent: {
    size: 2000,
    overlap: 400,
  },
  child: {
    size: 500,
    overlap: 100,
  },
} as const;