const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

/**
 * Solana operations using Helius RPC
 * Mainnet-beta
 */

// Initialize connection to Helius
let connection;

function getConnection() {
  if (!connection) {
    const rpcUrl = process.env.HELIUS_RPC_URL;
    if (!rpcUrl) {
      throw new Error('HELIUS_RPC_URL not set in environment');
    }
    connection = new Connection(rpcUrl, 'confirmed');
  }
  return connection;
}

/**
 * Create a new Solana wallet keypair
 * Returns: { publicKey: string, secretKey: Uint8Array }
 */
function createWallet() {
  const keypair = Keypair.generate();

  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey) // Convert to array for storage
  };
}

/**
 * Get SOL balance for an address
 * Returns: balance in SOL (not lamports)
 */
async function getBalance(address) {
  const conn = getConnection();
  const publicKey = new PublicKey(address);
  const lamports = await conn.getBalance(publicKey);

  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Send SOL from one wallet to another
 * fromSecretKey: Array of numbers (stored format)
 * toAddress: base58 string
 * amount: SOL amount (will be converted to lamports)
 * Returns: transaction signature
 */
async function sendSOL(fromSecretKey, toAddress, amount) {
  const conn = getConnection();

  // Reconstruct keypair from secret key array
  const secretKeyUint8 = new Uint8Array(fromSecretKey);
  const fromKeypair = Keypair.fromSecretKey(secretKeyUint8);

  const toPublicKey = new PublicKey(toAddress);
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports
    })
  );

  // Send transaction
  const signature = await sendAndConfirmTransaction(
    conn,
    transaction,
    [fromKeypair],
    {
      commitment: 'confirmed'
    }
  );

  return signature;
}

/**
 * Validate if a string is a valid Solana address
 */
function isValidAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  createWallet,
  getBalance,
  sendSOL,
  isValidAddress
};
