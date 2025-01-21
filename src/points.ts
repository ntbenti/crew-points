// src/points.ts

import { rarityCategories, godlikeNFTs, godlikeTokenIds, getNFTDataByTokenId } from "./config";
import { NFTData } from "./types";

/**
 * Determines the rarity multiplier for a given tokenId.
 * - Godlike NFTs have fixed multipliers.
 * - Other NFTs have multipliers based on their category and rank.
 *
 * @param tokenId - The token ID of the NFT.
 * @returns The multiplier associated with the NFT's rarity.
 */
const getRarityMultiplier = (tokenId: number): number => {
  // Check if the token is a Godlike NFT
  if (godlikeTokenIds.has(tokenId)) {
    const godlike = godlikeNFTs.find((nft) => nft.tokenId === tokenId);
    return godlike ? godlike.multiplier : 1.8; // Default to 1.8 if not found
  }

  // Get NFT data from nfts.json
  const nftData: NFTData | undefined = getNFTDataByTokenId(tokenId);
  if (!nftData) {
    console.warn(`NFT Data not found for tokenId: ${tokenId}. Using default multiplier.`);
    return 1.0; // Default multiplier if NFT data not found
  }

  const { rank } = nftData;

  // Find the rarity category based on rank
  const category = rarityCategories.find(
    (cat) => rank >= cat.startRank && rank <= cat.endRank
  );

  if (!category) {
    console.warn(`Rarity category not found for rank: ${rank}. Using default multiplier.`);
    return 1.0; // Default multiplier if category not found
  }

  // Calculate the position within the category
  const rankWithinCategory = rank - category.startRank + 1;
  const totalRanks = category.endRank - category.startRank + 1;
  const multiplierRange = category.maxMultiplier - category.minMultiplier;

  // Linear interpolation to assign a multiplier within the category
  const multiplier =
    category.minMultiplier + (multiplierRange * rankWithinCategory) / totalRanks;

  return multiplier;
};

/**
 * Computes the total points for a holder based on their NFTs and token balance.
 *
 * @param a - Scaling factor for NFTs.
 * @param b - Scaling factor for tokens.
 * @param nfts - Array of NFT tokenIds held by the user.
 * @param tokenBalance - ERC20 token balance held by the user (already adjusted for decimals).
 * @returns The total points for the holder.
 */
export const computePoints = (
  a: number,
  b: number,
  nfts: number[],
  tokenBalance: number,
): number => {
  // Sum the rarity multipliers for all NFTs held
  const nftSum = nfts.reduce((sum, tokenId) => {
    const rarityMultiplier = getRarityMultiplier(tokenId);
    return sum + rarityMultiplier;
  }, 0);

  // Calculate total points using the additive formula
  const points = (nftSum / a) + (tokenBalance / b);

  return points;
};
