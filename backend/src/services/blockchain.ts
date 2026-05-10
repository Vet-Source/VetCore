import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { logger } from '../utils/logger';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// In production: load from secure key management (AWS KMS / Secret Manager)
function getPlatformKeypair(): Keypair {
  const secretKey = process.env.SOLANA_PRIVATE_KEY;
  if (!secretKey) {
    logger.warn('No SOLANA_PRIVATE_KEY set — using ephemeral keypair for dev');
    return Keypair.generate();
  }
  return Keypair.fromSecretKey(Buffer.from(JSON.parse(secretKey)));
}

/**
 * Records a claim on the Solana blockchain.
 * In MVP: stores a memo transaction with the claim hash.
 * Production: calls the deployed Anchor program.
 */
export async function recordOnChain(
  claimId: string,
  amount: string
): Promise<{ txHash: string; onChainId: string }> {
  try {
    const payer = getPlatformKeypair();
    
    // Encode claim data as a memo (MVP approach)
    // Production: use Anchor program instruction
    const claimData = JSON.stringify({
      claimId,
      amount,
      timestamp: Date.now(),
      platform: 'VET-SOURCE',
    });

    const transaction = new Transaction().add({
      keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(claimData),
    });

    const txHash = await sendAndConfirmTransaction(connection, transaction, [payer]);
    
    logger.info(`Claim ${claimId} anchored on Solana: ${txHash}`);
    
    return {
      txHash,
      onChainId: `${claimId}-${txHash.slice(0, 8)}`,
    };
  } catch (error) {
    logger.error('Blockchain record error:', error);
    throw new Error(`Failed to record claim on blockchain: ${error}`);
  }
}

/**
 * Verifies a claim's on-chain record.
 */
export async function verifyOnChain(txHash: string): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(txHash, { commitment: 'confirmed' });
    return tx !== null && tx.meta?.err === null;
  } catch (error) {
    logger.error('Blockchain verification error:', error);
    return false;
  }
}

/**
 * Gets Solana network status.
 */
export async function getNetworkHealth(): Promise<{ slot: number; status: string }> {
  try {
    const slot = await connection.getSlot();
    return { slot, status: 'healthy' };
  } catch {
    return { slot: 0, status: 'unreachable' };
  }
}
