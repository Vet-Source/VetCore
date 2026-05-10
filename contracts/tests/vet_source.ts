import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VetSource } from "../target/types/vet_source";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import * as crypto from "crypto";

describe("vet_source", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VetSource as Program<VetSource>;
  const submitter = Keypair.generate();
  const reviewer = Keypair.generate();
  const clinicWallet = Keypair.generate();

  const claimId = `claim-${Date.now()}`;
  const dataHash = crypto.createHash('sha256').update(claimId).digest('hex');
  const amount = new anchor.BN(1_000_000); // 0.001 SOL

  let claimPDA: PublicKey;
  let claimBump: number;

  before(async () => {
    // Airdrop to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(submitter.publicKey, 2e9)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(reviewer.publicKey, 1e9)
    );

    [claimPDA, claimBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("claim"), Buffer.from(claimId)],
      program.programId
    );
  });

  it("✅ Submits a new claim", async () => {
    const tx = await program.methods
      .submitClaim(claimId, amount, dataHash, clinicWallet.publicKey)
      .accounts({
        claimAccount: claimPDA,
        submitter: submitter.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([submitter])
      .rpc();

    console.log("  Submit tx:", tx);

    const account = await program.account.claimAccount.fetch(claimPDA);
    assert.equal(account.claimId, claimId);
    assert.equal(account.dataHash, dataHash);
    assert.ok(account.submitter.equals(submitter.publicKey));
    assert.deepEqual(account.status, { submitted: {} });
    console.log("  ✓ Claim submitted with status:", JSON.stringify(account.status));
  });

  it("✅ Approves a claim", async () => {
    const approvedAmount = new anchor.BN(900_000); // partial approval
    const notesHash = crypto.createHash('sha256').update('approved').digest('hex');

    const tx = await program.methods
      .approveClaim(approvedAmount, notesHash)
      .accounts({
        claimAccount: claimPDA,
        reviewer: reviewer.publicKey,
      })
      .signers([reviewer])
      .rpc();

    console.log("  Approve tx:", tx);

    const account = await program.account.claimAccount.fetch(claimPDA);
    assert.deepEqual(account.status, { approved: {} });
    assert.equal(account.approvedAmount.toNumber(), 900_000);
    console.log("  ✓ Claim approved for", account.approvedAmount.toNumber(), "lamports");
  });

  it("✅ Cannot approve already-approved claim", async () => {
    try {
      await program.methods
        .approveClaim(amount, dataHash)
        .accounts({ claimAccount: claimPDA, reviewer: reviewer.publicKey })
        .signers([reviewer])
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: any) {
      assert.include(err.message, "InvalidClaimStatus");
      console.log("  ✓ Correctly rejected double-approval");
    }
  });

  it("✅ Submits and rejects a second claim", async () => {
    const claim2Id = `claim-reject-${Date.now()}`;
    const hash2 = crypto.createHash('sha256').update(claim2Id).digest('hex');
    const [pda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("claim"), Buffer.from(claim2Id)],
      program.programId
    );

    await program.methods
      .submitClaim(claim2Id, amount, hash2, clinicWallet.publicKey)
      .accounts({ claimAccount: pda2, submitter: submitter.publicKey, systemProgram: SystemProgram.programId })
      .signers([submitter])
      .rpc();

    await program.methods
      .rejectClaim(hash2)
      .accounts({ claimAccount: pda2, reviewer: reviewer.publicKey })
      .signers([reviewer])
      .rpc();

    const account = await program.account.claimAccount.fetch(pda2);
    assert.deepEqual(account.status, { rejected: {} });
    console.log("  ✓ Claim rejected successfully");
  });
});
