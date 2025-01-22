// src/bot.ts

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
import logger from './logger'; // Import the logger
import { readFileSync } from 'fs';
import { join } from 'path';
import { NFTData } from "./types";
import { decodeEventLog } from "viem";

// Load environment variables
dotenv.config();

/**
 * Configuration for the points calculation.
 * Adjust these values as per your requirements.
 */
const CONFIG = {
  NFT_SCALING_FACTOR_A: Number(process.env.A) || 10, // Example value
  TOKEN_SCALING_FACTOR_B: Number(process.env.B) || 165000, // Example value
};

const RPC_URL = process.env.RPC_URL as string;

/**
 * Initialize the Viem public client.
 */
const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

/**
 * HolderData Type
 */
type HolderData = {
  address: string;
  nfts: number[];
  tokenBalance: bigint;
  points: number;
  blockNumber: number;
  time: Date;
}

/**
 * Initialize Contract Instances
 */
const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS as `0x${string}`;
const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS as `0x${string}`;

const nftContract = getContract({
  address: nftContractAddress,
  abi: ERC721_ABI,
  client: client,
});

const tokenContract = getContract({
  address: tokenContractAddress,
  abi: ERC20_ABI,
  client: client,
});

/**
 * Load NFT Data from nfts.json
 */
const nftsFilePath = join(__dirname, 'nfts.json');
let nftDataList: NFTData[] = [];

try {
  const nftDataRaw = readFileSync(nftsFilePath, 'utf-8');
  nftDataList = JSON.parse(nftDataRaw) as NFTData[];
  logger.info(`Loaded ${nftDataList.length} NFT records from nfts.json`);
} catch (error) {
  logger.error("Failed to load nfts.json:", error);
  process.exit(1);
}

/**
 * Fetch holder data from the blockchain.
 * This implementation fetches all holders by parsing Transfer events.
 * Note: For large NFT collections, consider using an indexing service like The Graph.
 */
const fetchHolderData = async (): Promise<HolderData[]> => {
  try {
    // Fetch all Transfer events from the NFT contract
    const transferEvents = await client.getLogs({
      address: nftContract.address,
      event: nftContract.abi.find(x => x.name === 'Transfer'),
      fromBlock: 14517616n, // Start from a more recent block, e.g., block 16M
      toBlock: 'latest'
    });

    logger.info(`Fetched ${transferEvents.length} Transfer events`);

    // Map to keep track of holder's NFTs
    const holdersMap: Map<string, Set<number>> = new Map();

    transferEvents.forEach((log) => {
      const event = decodeEventLog({
        abi: nftContract.abi,
        data: log.data,
        topics: log.topics
      }) as { args: { from: string; to: string; tokenId: bigint } };
      const { from, to, tokenId } = event.args;

      // Handle 'from' address (exclude zero address for mint events)
      if (from !== "0x0000000000000000000000000000000000000000") {
        if (!holdersMap.has(from)) {
          holdersMap.set(from, new Set());
        }
        holdersMap.get(from)!.delete(Number(tokenId));
      }

      // Handle 'to' address (exclude zero address for burn events)
      if (to !== "0x0000000000000000000000000000000000000000") {
        if (!holdersMap.has(to)) {
          holdersMap.set(to, new Set());
        }
        holdersMap.get(to)!.add(Number(tokenId));
      }
    });

    logger.info(`Identified ${holdersMap.size} unique holders`);

    // Fetch token balances in batches to optimize performance
    const holderAddresses = Array.from(holdersMap.keys());
    const BATCH_SIZE = 100; // Adjust based on performance

    const holdersData: HolderData[] = [];

    for (let i = 0; i < holderAddresses.length; i += BATCH_SIZE) {
      const batch = holderAddresses.slice(i, i + BATCH_SIZE);

      // Fetch token balances for the batch
      const balances = await Promise.all(
        batch.map(address => tokenContract.read.balanceOf([address as `0x${string}`]))
      );

      // Get current block number
      const blockNumber = await client.getBlockNumber();

      // Create HolderData entries
      batch.forEach((address, index) => {
        const tokenBalance = balances[index];
        holdersData.push({
          address,
          nfts: Array.from(holdersMap.get(address)!),
          tokenBalance,
          points: 0, // Will be calculated
          blockNumber: Number(blockNumber),
          time: new Date(),
        });
      });

      logger.info(`Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(holderAddresses.length / BATCH_SIZE)}`);
    }

    logger.info(`Total holders fetched: ${holdersData.length}`);

    return holdersData;
  } catch (error) {
    logger.error("Error fetching holder data:", error);
    throw error;
  }
};

/**
 * Main function to execute the points tracking process.
 */
export const main = async () => {
  try {
    // Fetch holder data (addresses, NFTs, token balances)
    const holdersData = await fetchHolderData();

    if (holdersData.length === 0) {
      logger.info("No holders data fetched.");
      return;
    }

    // Get current block number
    const currentBlock = await client.getBlockNumber();

    // Process holders in batches to optimize performance
    const BATCH_SIZE = 100;
    for (let i = 0; i < holdersData.length; i += BATCH_SIZE) {
      const batch = holdersData.slice(i, i + BATCH_SIZE);

      // Process each holder in the batch
      await Promise.all(batch.map(async (holderData) => {
        // Compute points
        const points = computePoints(
          CONFIG.NFT_SCALING_FACTOR_A,
          CONFIG.TOKEN_SCALING_FACTOR_B,
          holderData.nfts,
          Number(holderData.tokenBalance) // Ensure tokenBalance is within safe integer range
        );

        // Update or create the holder in the database
        const updatedHolder = await Holder.findOneAndUpdate(
          { address: holderData.address },
          {
            nfts: holderData.nfts,
            tokenBalance: holderData.tokenBalance.toString(), // Convert BigInt to string
            points: points,
            blockNumber: holderData.blockNumber,
            time: holderData.time,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info(`Holder ${updatedHolder.address} updated with ${points.toFixed(2)} points.`);
      }));
    }

    logger.info(`Points tracking process completed at block ${currentBlock}`);
  } catch (error) {
    logger.error("Error in main function:", error);
    throw error; // Rethrow to be caught by the scheduler
  }
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Connect to MongoDB before scheduling tasks
 */
connectDB().then(() => {
  // Schedule the main function to run at the start of every hour
  cron.schedule('0 * * * *', async () => {
    logger.info(`Starting hourly snapshot... [${new Date().toISOString()}]`);
    try {
      await main();
      logger.info(`Snapshot completed successfully. [${new Date().toISOString()}]`);
    } catch (error) {
      logger.error(`Snapshot failed: ${error} [${new Date().toISOString()}]`);
    }
  });

  /**
   * Optional: Run an initial snapshot immediately when the script starts
   */
  (async () => {
    try {
      logger.info(`Running initial snapshot... [${new Date().toISOString()}]`);
      await main();
      logger.info(`Initial snapshot completed. [${new Date().toISOString()}]`);
    } catch (error) {
      logger.error("Fatal error during initial snapshot:", error);
      process.exit(1);
    }
  })();
});
