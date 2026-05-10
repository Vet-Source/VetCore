/**
 * Anchor program client for VET-SOURCE claim lifecycle.
 *
 * Lazily constructs an `@coral-xyz/anchor` Program from the IDL produced by
 * `anchor build` (default at contracts/target/idl/vet_source.json — overridable
 * via ANCHOR_IDL_PATH). When PROGRAM_ID, SOLANA_PRIVATE_KEY, or the IDL file
 * are missing, every helper logs a warning and resolves to null instead of
 * throwing — claims still process off-chain.
 */
import {
  AnchorProvider,
  Program,
  Wallet,
  BN,
  setProvider,
  Idl,
} from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../utils/logger";

let cached: { program: Program; provider: AnchorProvider; programId: PublicKey } | null = null;
let attempted = false;

function loadIdl(): Idl | null {
  const candidates = [
    process.env.ANCHOR_IDL_PATH,
    path.resolve(process.cwd(), "../contracts/target/idl/vet_source.json"),
    path.resolve(process.cwd(), "../../contracts/target/idl/vet_source.json"),
    path.resolve(__dirname, "../../../contracts/target/idl/vet_source.json"),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const json = fs.readFileSync(p, "utf-8");
        return JSON.parse(json) as Idl;
      }
    } catch {/* ignore, try next */}
  }
  return null;
}

function loadKeypair(): Keypair | null {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch (err) {
    logger.warn("Could not parse SOLANA_PRIVATE_KEY: " + (err as Error)?.message);
    return null;
  }
}

function getProgram(): typeof cached {
  if (cached) return cached;
  if (attempted) return null;
  attempted = true;

  const programIdRaw = process.env.PROGRAM_ID;
  if (!programIdRaw || programIdRaw === "placeholder" || programIdRaw === "REPLACE_WITH_YOUR_PROGRAM_ID") {
    logger.warn("Anchor disabled: PROGRAM_ID is not set. Run `anchor deploy` and update .env.");
    return null;
  }

  const idl = loadIdl();
  if (!idl) {
    logger.warn("Anchor disabled: IDL not found. Run `anchor build` in /contracts to generate it.");
    return null;
  }

  const keypair = loadKeypair();
  if (!keypair) {
    logger.warn("Anchor disabled: SOLANA_PRIVATE_KEY missing or malformed.");
    return null;
  }

  let programId: PublicKey;
  try {
    programId = new PublicKey(programIdRaw);
  } catch {
    logger.warn(`Anchor disabled: PROGRAM_ID is not a valid base58 pubkey (${programIdRaw}).`);
    return null;
  }

  const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );
  const wallet = new Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  setProvider(provider);

  const program = new Program(idl, provider);
  cached = { program, provider, programId };
  logger.info(`Anchor program loaded (${programIdRaw}, network=${process.env.SOLANA_NETWORK ?? "devnet"})`);
  return cached;
}

function deriveClaimPda(programId: PublicKey, claimId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("claim"), Buffer.from(claimId)],
    programId
  );
  return pda;
}

export interface OnChainResult {
  txHash: string;
  onChainId: string;
}

/** Submit a claim on-chain. Returns null when Anchor is not configured. */
export async function submitClaimOnChain(args: {
  claimId: string;          // ≤64 chars; we'll typically pass Claim.id (uuid)
  amountLamports: number;   // u64
  dataHash: string;         // 64-char SHA-256 hex
  clinicWallet: PublicKey;
}): Promise<OnChainResult | null> {
  const ctx = getProgram();
  if (!ctx) return null;
  try {
    const claimPda = deriveClaimPda(ctx.programId, args.claimId);
    // @ts-ignore — methods names depend on the IDL, not the ts type system here
    const tx: string = await ctx.program.methods
      .submitClaim(args.claimId, new BN(args.amountLamports), args.dataHash, args.clinicWallet)
      .accounts({
        claimAccount:  claimPda,
        submitter:     ctx.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    logger.info(`Claim ${args.claimId} submitted on-chain: ${tx}`);
    return { txHash: tx, onChainId: claimPda.toBase58() };
  } catch (err) {
    logger.error(`submitClaimOnChain failed: ${(err as Error)?.message}`);
    return null;
  }
}

/** Approve a claim on-chain. */
export async function approveClaimOnChain(args: {
  claimId: string;
  approvedAmountLamports: number;
  notesHash: string; // 64-char hex
}): Promise<OnChainResult | null> {
  const ctx = getProgram();
  if (!ctx) return null;
  try {
    const claimPda = deriveClaimPda(ctx.programId, args.claimId);
    // @ts-ignore
    const tx: string = await ctx.program.methods
      .approveClaim(new BN(args.approvedAmountLamports), args.notesHash)
      .accounts({
        claimAccount: claimPda,
        reviewer:     ctx.provider.wallet.publicKey,
      })
      .rpc();
    logger.info(`Claim ${args.claimId} approved on-chain: ${tx}`);
    return { txHash: tx, onChainId: claimPda.toBase58() };
  } catch (err) {
    logger.error(`approveClaimOnChain failed: ${(err as Error)?.message}`);
    return null;
  }
}

/** Reject a claim on-chain. */
export async function rejectClaimOnChain(args: {
  claimId: string;
  reasonHash: string; // 64-char hex
}): Promise<OnChainResult | null> {
  const ctx = getProgram();
  if (!ctx) return null;
  try {
    const claimPda = deriveClaimPda(ctx.programId, args.claimId);
    // @ts-ignore
    const tx: string = await ctx.program.methods
      .rejectClaim(args.reasonHash)
      .accounts({
        claimAccount: claimPda,
        reviewer:     ctx.provider.wallet.publicKey,
      })
      .rpc();
    logger.info(`Claim ${args.claimId} rejected on-chain: ${tx}`);
    return { txHash: tx, onChainId: claimPda.toBase58() };
  } catch (err) {
    logger.error(`rejectClaimOnChain failed: ${(err as Error)?.message}`);
    return null;
  }
}

/** Convert a decimal amount string ("250.00") to lamports (1 SOL = 1e9). */
export function amountToLamports(amount: number | string): number {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return Math.round(n * 1_000_000_000);
}

/** SHA-256 hex of an arbitrary string, helper for callers. */
export function sha256Hex(input: string): string {
  // dynamic import to avoid pulling crypto into module boot if unused
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(input).digest("hex");
}
