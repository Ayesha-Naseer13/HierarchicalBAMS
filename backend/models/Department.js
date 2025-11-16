import mongoose from 'mongoose';
import { Blockchain } from '../blockchain/Blockchain.js';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  blockchain: { type: Object, default: null },
  blockchainData: [Object],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Department', departmentSchema);
