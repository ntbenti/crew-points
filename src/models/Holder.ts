// src/models/Holder.ts

import mongoose, { Schema, Document } from 'mongoose';

/**
 * IHolder Interface
 * Represents a holder with their address, NFTs, token balance, points, block number, and timestamp.
 */
export interface IHolder extends Document {
  address: string;
  nfts: number[];
  tokenBalance: bigint;
  points: number;
  blockNumber: number;
  time: Date;
}

const HolderSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true },
  nfts: { type: [Number], required: true },
  tokenBalance: { type: Schema.Types.BigInt, required: true },
  points: { type: Number, required: true },
  blockNumber: { type: Number, required: true },
  time: { type: Date, required: true },
});

const Holder = mongoose.model<IHolder>('Holder', HolderSchema);

export default Holder;
