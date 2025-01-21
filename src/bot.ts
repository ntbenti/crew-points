// src/bot.ts

import cron from 'node-cron';
import { createPublicClient, getContract, http } from "viem";
import { mainnet } from "viem/chains";
import { z } from "zod";
import * as dotenv from "dotenv";
import { ERC721_ABI } from "./abis/erc721";
import { ERC20_ABI } from "./abis/erc20";
import { computePoints } from "./points";
import connectDB from "./database"; // Import the database connection
import Holder, { IHolder } from "./models/Holder"; // Import your Mongoose model and interface

dotenv.config();

/**
 * Configuration for the points calculation.
 * Adjust these values as per your requirements.
 */
const CONFIG = {
  NFT_SCALING_FACTOR_A: 10, // Example value
  TOKEN_SCALING_FACTOR_B: 5, // Example value
};

/**
 * Initialize the Viem public client.
 */
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Add this type at the top
type HolderData = {
  address: string;
  nfts: number[];
  tokenBalance: bigint;
  points: number;
  blockNumber: number;
  time: Date;
}

/**
 * Fetch holder data from the blockchain.
 * This is a mock implementation for testing purposes.
 * Replace this with actual logic to fetch holder data.
 */
const fetchHolderData = async (): Promise<HolderData[]> => {
  // Update the mock data type
  const mockData: HolderData[] = [
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nfts: [1, 2, 3],
      tokenBalance: BigInt("1500"),
      points: 0, // Will be calculated
      blockNumber: 12345678,
      time: new Date(),
    },
    {
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      nfts: [4, 5],
      tokenBalance: BigInt("800"),
      points: 0, // Will be calculated
      blockNumber: 12345679,
      time: new Date(),
    },
  ];

  // In a real implementation, fetch data from the blockchain here

  return mockData;
};

/**
 * Main function to execute the points tracking process.
 */
export const main = async () => {
  try {
    // Fetch holder data (addresses, NFTs, token balances)
    const holdersData = await fetchHolderData();

    if (holdersData.length === 0) {
      console.log("No holders data fetched.");
      return;
    }

    for (const holderData of holdersData) {
      // Compute points
      const points = computePoints(
        CONFIG.NFT_SCALING_FACTOR_A,
        CONFIG.TOKEN_SCALING_FACTOR_B,
        holderData.nfts,
        Number(holderData.tokenBalance)
      );

      // Update or create the holder in the database
      const updatedHolder = await Holder.findOneAndUpdate(
        { address: holderData.address },
        {
          nfts: holderData.nfts,
          tokenBalance: holderData.tokenBalance,
          points: points,
          blockNumber: holderData.blockNumber,
          time: holderData.time,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Holder ${updatedHolder.address} updated with ${points} points.`);
    }
  } catch (error) {
    console.error("Error in main function:", error);
    throw error; // Rethrow to be caught by the scheduler
  }
};

/**
 * Connect to MongoDB before scheduling tasks
 */
connectDB().then(() => {
  // Schedule the main function to run at the start of every hour
  cron.schedule('0 * * * *', () => {
    console.log(`[${new Date().toISOString()}] Starting hourly snapshot...`);
    main()
      .then(() => {
        console.log(`[${new Date().toISOString()}] Snapshot completed successfully.`);
      })
      .catch((error) => {
        console.error(`[${new Date().toISOString()}] Snapshot failed:`, error);
      });
  });

  /**
   * Optional: Run an initial snapshot immediately when the script starts
   */
  (async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running initial snapshot...`);
      await main();
      console.log(`[${new Date().toISOString()}] Initial snapshot completed.`);
    } catch (error) {
      console.error("Fatal error during initial snapshot:", error);
      process.exitCode = 1;
    }
  })();
});
