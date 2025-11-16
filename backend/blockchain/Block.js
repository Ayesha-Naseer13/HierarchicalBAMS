import crypto from 'crypto';

export class Block {
  constructor(index, timestamp, transactions, prevHash, chainType = 'department') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.nonce = 0;
    this.chainType = chainType;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const data = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      prevHash: this.prevHash,
      nonce: this.nonce,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  mineBlock(difficulty = 4) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}
