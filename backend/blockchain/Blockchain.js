import { Block } from './Block.js';

export class Blockchain {
  constructor(genesisData = {}, chainType = 'department') {
    this.chain = [];
    this.chainType = chainType;
    this.difficulty = 4;
    
    // Create genesis block
    const genesisBlock = new Block(
      0,
      Date.now(),
      [genesisData],
      '0',
      chainType
    );
    genesisBlock.mineBlock(this.difficulty);
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(transactions) {
    const latestBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      transactions,
      latestBlock.hash,
      this.chainType
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Recalculate hash to check tampering
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`Block ${i} has been tampered with`);
        return false;
      }

      // Check previous hash reference
      if (currentBlock.prevHash !== previousBlock.hash) {
        console.log(`Block ${i} has invalid previous hash`);
        return false;
      }

      // Verify Proof of Work
      const target = '0'.repeat(this.difficulty);
      if (!currentBlock.hash.substring(0, this.difficulty) === target) {
        console.log(`Block ${i} has invalid Proof of Work`);
        return false;
      }
    }
    return true;
  }

  getChainData() {
    return this.chain.map((block) => ({
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      prevHash: block.prevHash,
      hash: block.hash,
      nonce: block.nonce,
    }));
  }
}
