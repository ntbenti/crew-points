// src/models/Holder.ts

import mongoose, { Schema, Document } from 'mongoose';

/**
 * IHolder Interface
 * Represents a holder with their address, NFTs, token balance, points, block number, and timestamp.
 */
export interface IHolder extends Document {
  address: string;
  nfts: number[];
  tokenBalance: string; // Stored as string to prevent precision loss
  points: number;
  blockNumber: number;
  time: Date;
}

const HolderSchema: Schema = new Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    match: /^0x[a-fA-F0-9]{40}$/, // Validate Ethereum address format
  },
  nfts: {
    type: [Number],
    required: true,
    validate: {
      validator: (v: number[]) => v.every((id) => id > 0),
      message: "NFT tokenIds must be positive numbers.",
    },
  },
  tokenBalance: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^\d+(\.\d+)?$/.test(v),
      message: "Token balance must be a numeric string.",
    },
  },
  points: {
    type: Number,
    required: true,
    min: [0, "Points cannot be negative."],
  },
  blockNumber: {
    type: Number,
    required: true,
    min: [14517616, "Block number cannot be negative."], // Adjusted min to your deployment block
  },
  time: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Index holders by descending points for efficient querying
HolderSchema.index({ points: -1 });

const Holder = mongoose.model<IHolder>('Holder', HolderSchema);

export default Holder;
