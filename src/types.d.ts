// src/types.d.ts

/**
 * RarityData:
 * - Represents a rarity category with its name, rank range, and multiplier range.
 */
export type RarityData = {
  category: string;
  startRank: number;
  endRank: number;
  minMultiplier: number;
  maxMultiplier: number;
};

/**
 * GodlikeNFT:
 * - Represents a Godlike NFT with its tokenId and specific multiplier.
 */
export type GodlikeNFT = {
  tokenId: number;
  multiplier: number; // Between 1.8 and 2.0
};

/**
 * NFTData:
 * - Represents the data structure of each NFT in nfts.json.
 */
export type NFTData = {
  tokenId: number;
  score: number;
  rank: number;
};
