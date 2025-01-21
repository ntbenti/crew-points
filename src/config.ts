// src/config.ts

import { RarityData, GodlikeNFT, NFTData } from "./types";
import nfts from "./nfts.json";

/**
 * Rarity Categories:
 * - Mortal: Rank 1-833 (rarest)
 * - Ascendant: Rank 834-1666
 * - Divine: Rank 1667-2500
 * - Celestial: Rank 2501-3333 (most common)
 */
export const rarityCategories: RarityData[] = [
  {
    category: "Celestial",
    startRank: 1,
    endRank: 429,
    minMultiplier: 1.6,
    maxMultiplier: 1.8,
  },
  {
    category: "Divine",
    startRank: 430,
    endRank: 1093,
    minMultiplier: 1.3,
    maxMultiplier: 1.6,
  },
  {
    category: "Ascendant",
    startRank: 1094,
    endRank: 2013,
    minMultiplier: 1.1,
    maxMultiplier: 1.3,
  },
  {
    category: "Mortal",
    startRank: 2014,
    endRank: 3333,
    minMultiplier: 1.0,
    maxMultiplier: 1.1,
  },
];

/**
 * Godlike NFTs:
 * - Pre-selected NFTs with fixed multipliers between 1.8x and 2.0x.
 * - These are handled separately from the regular rarity categories.
 */
export const godlikeNFTs: GodlikeNFT[] = [
  // Example entries. Replace with your actual Godlike NFT tokenIds and multipliers.
  { tokenId: 1888, multiplier: 2.2 },
  { tokenId: 986, multiplier: 2 },
  { tokenId: 2117, multiplier: 2 },
  { tokenId: 3193, multiplier: 2 },
  { tokenId: 2747, multiplier: 2 },
  { tokenId: 966, multiplier: 2 },
  { tokenId: 581, multiplier: 1.9 },
  { tokenId: 600, multiplier: 1.9 },
  { tokenId: 1922, multiplier: 1.9 },
  { tokenId: 125, multiplier: 1.9 },
  { tokenId: 85, multiplier: 1.9 },
  { tokenId: 431, multiplier: 1.9 },
  { tokenId: 508, multiplier: 1.9 },
  { tokenId: 997, multiplier: 1.9 },
  { tokenId: 1255, multiplier: 1.9 },
  { tokenId: 1489, multiplier: 1.9 },
  { tokenId: 1501, multiplier: 1.9 },
  { tokenId: 1531, multiplier: 1.9 },
  { tokenId: 1611, multiplier: 1.9 },
  { tokenId: 1629, multiplier: 1.9 },
  { tokenId: 1829, multiplier: 1.9 },
  { tokenId: 2006, multiplier: 1.9 },
  { tokenId: 2095, multiplier: 1.9 },
  { tokenId: 2133, multiplier: 1.9 },
  { tokenId: 2152, multiplier: 1.9 },
  { tokenId: 2482, multiplier: 1.9 },
  { tokenId: 2856, multiplier: 1.9 },
  { tokenId: 2874, multiplier: 1.9 },
  { tokenId: 2959, multiplier: 1.9 },
  { tokenId: 3195, multiplier: 1.9 },
  { tokenId: 3260, multiplier: 1.9 },
  { tokenId: 189, multiplier: 1.8 },
  { tokenId: 393, multiplier: 1.8 },
  { tokenId: 453, multiplier: 1.8 },
  { tokenId: 448, multiplier: 1.8 },
  { tokenId: 686, multiplier: 1.8 },
  { tokenId: 1002, multiplier: 1.8 },
  { tokenId: 1006, multiplier: 1.8 },
  { tokenId: 1182, multiplier: 1.8 },
  { tokenId: 1332, multiplier: 1.8 },
  { tokenId: 1425, multiplier: 1.8 },
  { tokenId: 1652, multiplier: 1.8 },
  { tokenId: 2122, multiplier: 1.8 },
  { tokenId: 2251, multiplier: 1.8 },
  { tokenId: 2399, multiplier: 1.8 },
  { tokenId: 3000, multiplier: 1.8 },
  { tokenId: 3055, multiplier: 1.8 },
  { tokenId: 163, multiplier: 1.8 },
  { tokenId: 270, multiplier: 1.8 },
  { tokenId: 352, multiplier: 1.8 },
  { tokenId: 651, multiplier: 1.8 },
  { tokenId: 677, multiplier: 1.8 },
  { tokenId: 851, multiplier: 1.8 },
  { tokenId: 967, multiplier: 1.8 },
  { tokenId: 973, multiplier: 1.8 },
  { tokenId: 993, multiplier: 1.8 },
  { tokenId: 1127, multiplier: 1.8 },
  { tokenId: 1169, multiplier: 1.8 },
  { tokenId: 1265, multiplier: 1.8 },
  { tokenId: 1553, multiplier: 1.8 },
  { tokenId: 1962, multiplier: 1.8 },
  { tokenId: 1991, multiplier: 1.8 },
  { tokenId: 2065, multiplier: 1.8 },
  { tokenId: 2291, multiplier: 1.8 },
  { tokenId: 2337, multiplier: 1.8 },
  { tokenId: 2637, multiplier: 1.8 },
  { tokenId: 2639, multiplier: 1.8 },
  { tokenId: 2675, multiplier: 1.8 },
  { tokenId: 2755, multiplier: 1.8 },
  { tokenId: 2857, multiplier: 1.8 },
  { tokenId: 115, multiplier: 1.8 },
  { tokenId: 2576, multiplier: 1.8 },
  { tokenId: 954, multiplier: 1.8 },
  { tokenId: 1177, multiplier: 1.8 },
  { tokenId: 268, multiplier: 1.8 },
  { tokenId: 1603, multiplier: 1.8 },
  { tokenId: 1894, multiplier: 1.8 },
  { tokenId: 2623, multiplier: 1.8 },
  { tokenId: 818, multiplier: 1.8 },
  { tokenId: 1776, multiplier: 1.8 },
  { tokenId: 2209, multiplier: 1.8 },
  // Add more Godlike NFTs as needed.
];

/**
 * Get all Godlike tokenIds for easy lookup.
 */
export const godlikeTokenIds: Set<number> = new Set(
  godlikeNFTs.map((nft) => nft.tokenId)
);

/**
 * Get NFT data by tokenId.
 * @param tokenId - The token ID of the NFT.
 * @returns The NFTData object if found, else undefined.
 */
export const getNFTDataByTokenId = (tokenId: number): NFTData | undefined => {
  return nfts.find((nft) => nft.tokenId === tokenId);
};
