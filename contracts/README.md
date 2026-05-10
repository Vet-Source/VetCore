# VET-SOURCE Anchor program

Solana program implementing the on-chain portion of the VET-SOURCE claim lifecycle.

## Instructions

| Instruction       | Args                                                       | Effect |
|-------------------|------------------------------------------------------------|--------|
| `submit_claim`    | `claim_id`, `amount_lamports`, `data_hash` (SHA-256), `clinic_wallet` | Initialises a `ClaimAccount` PDA, status = `Submitted`. Emits `ClaimSubmittedEvent`. |
| `approve_claim`   | `approved_amount`, `notes_hash`                            | Transitions to `Approved`. Validates `approved_amount <= claim.amount`. Emits `ClaimApprovedEvent`. |
| `reject_claim`    | `reason_hash`                                              | Transitions to `Rejected`. Emits `ClaimRejectedEvent`. |
| `dispute_claim`   | —                                                          | Allowed only from `Rejected`; transitions to `Disputed`. |

PDA seeds: `["claim", claim_id.as_bytes()]`.

## Build & deploy

> Recommended environment: WSL2 (Ubuntu) on Windows, or any Linux/macOS host.

Prerequisites:

- Rust (`rustup default stable`)
- Solana CLI (https://docs.solana.com/cli/install-solana-cli-tools)
- Anchor CLI 0.30.1 (`avm install 0.30.1 && avm use 0.30.1`)
- Node 18+ and Yarn

```bash
cd contracts
yarn install

# First build generates a fresh keypair under target/deploy/vet_source-keypair.json
anchor build

# Read the program's public key
anchor keys list
# vet_source: <YOUR_PROGRAM_ID>

# Paste that ID into:
#   contracts/Anchor.toml  (programs.localnet and programs.devnet)
#   contracts/src/lib.rs   (declare_id!)
# then rebuild:
anchor build

# Local tests (uses anchor's bundled validator)
anchor test

# Devnet deploy
solana airdrop 2 --url devnet
anchor deploy --provider.cluster devnet
```

## Backend integration

After deploying, set the following in `backend/.env`:

```
PROGRAM_ID=<YOUR_PROGRAM_ID>
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=[1,2,3,...]   # JSON array of the platform keypair's secret key
```

The backend will load the IDL from `contracts/target/idl/vet_source.json` automatically (path overridable via `ANCHOR_IDL_PATH`). If the IDL or `PROGRAM_ID` is missing, the integration silently no-ops and logs a warning — claims still process normally; they just don't get an on-chain receipt.
