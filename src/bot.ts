// src/bot.ts

import cron from 'node-cron';
import { createPublicClient, getContract, http } from "viem";
import { mainnet } from "viem/chains";
import { z } from "zod";
import * as dotenv from "dotenv";
import { ERC721_ABI } from "./abis/erc721";
import { ERC20_ABI } from "./abis/erc20";
import { computePoints } from "./points";

dotenv.config();

// ... [rest of your existing imports and configurations]

/**
 * Main function to execute the points tracking process.
 */
export const main = async () => {
  // [Your existing main function code]
};

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
