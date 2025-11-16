import './BlockchainViewer.css';

export default function BlockchainViewer({ blocks }) {
  return (
    <div className="blockchain-viewer">
      <div className="blockchain-chain">
        {blocks.map((block, idx) => (
          <div key={idx} className="block">
            <div className="block-header">
              <span className="block-index">Block #{block.index}</span>
              <span className="block-nonce">Nonce: {block.nonce}</span>
            </div>
            <div className="block-content">
              <p className="hash-label">Hash:</p>
              <p className="hash-value">{block.hash.substring(0, 16)}...</p>
              <p className="hash-label">Prev Hash:</p>
              <p className="hash-value">{block.prevHash.substring(0, 16)}...</p>
              <p className="timestamp">
                {new Date(block.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="transactions">
              {block.transactions.map((tx, txIdx) => (
                <div key={txIdx} className="transaction">
                  <p className="tx-type">{tx.type}</p>
                  {tx.status && <p className="tx-status">Status: {tx.status}</p>}
                  {tx.name && <p className="tx-data">Name: {tx.name}</p>}
                </div>
              ))}
            </div>
            {idx < blocks.length - 1 && <div className="chain-link">↓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
