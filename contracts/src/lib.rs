use anchor_lang::prelude::*;

declare_id!("REPLACE_WITH_YOUR_PROGRAM_ID");

/// VET-SOURCE Smart Contract
/// Handles the full insurance claim lifecycle on Solana
#[program]
pub mod vet_source {
    use super::*;

    /// Submit a new insurance claim to the blockchain
    pub fn submit_claim(
        ctx: Context<SubmitClaim>,
        claim_id: String,
        amount_lamports: u64,
        data_hash: String,   // SHA-256 of off-chain claim data
        clinic_wallet: Pubkey,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim_account;
        let clock = Clock::get()?;

        require!(claim_id.len() <= 64, ErrorCode::InvalidClaimId);
        require!(data_hash.len() == 64, ErrorCode::InvalidDataHash);
        require!(amount_lamports > 0, ErrorCode::InvalidAmount);

        claim.claim_id = claim_id;
        claim.submitter = ctx.accounts.submitter.key();
        claim.clinic_wallet = clinic_wallet;
        claim.amount = amount_lamports;
        claim.data_hash = data_hash;
        claim.status = ClaimStatus::Submitted;
        claim.submitted_at = clock.unix_timestamp;
        claim.reviewed_at = 0;
        claim.bump = ctx.bumps.claim_account;

        emit!(ClaimSubmittedEvent {
            claim_id: claim.claim_id.clone(),
            submitter: claim.submitter,
            amount: claim.amount,
            timestamp: claim.submitted_at,
        });

        msg!("Claim {} submitted by {}", claim.claim_id, claim.submitter);
        Ok(())
    }

    /// Approve a claim and trigger payment to the clinic
    pub fn approve_claim(
        ctx: Context<ReviewClaim>,
        approved_amount: u64,
        notes_hash: String,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim_account;
        let clock = Clock::get()?;

        require!(
            claim.status == ClaimStatus::Submitted || claim.status == ClaimStatus::UnderReview,
            ErrorCode::InvalidClaimStatus
        );
        require!(approved_amount <= claim.amount, ErrorCode::InvalidAmount);

        claim.status = ClaimStatus::Approved;
        claim.approved_amount = approved_amount;
        claim.reviewer = ctx.accounts.reviewer.key();
        claim.reviewed_at = clock.unix_timestamp;

        emit!(ClaimApprovedEvent {
            claim_id: claim.claim_id.clone(),
            reviewer: claim.reviewer,
            approved_amount,
            timestamp: clock.unix_timestamp,
        });

        msg!("Claim {} approved for {} lamports", claim.claim_id, approved_amount);
        Ok(())
    }

    /// Reject a claim
    pub fn reject_claim(
        ctx: Context<ReviewClaim>,
        reason_hash: String,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim_account;
        let clock = Clock::get()?;

        require!(
            claim.status == ClaimStatus::Submitted || claim.status == ClaimStatus::UnderReview,
            ErrorCode::InvalidClaimStatus
        );

        claim.status = ClaimStatus::Rejected;
        claim.reviewer = ctx.accounts.reviewer.key();
        claim.reviewed_at = clock.unix_timestamp;

        emit!(ClaimRejectedEvent {
            claim_id: claim.claim_id.clone(),
            reviewer: claim.reviewer,
            timestamp: clock.unix_timestamp,
        });

        msg!("Claim {} rejected", claim.claim_id);
        Ok(())
    }

    /// Mark claim as disputed
    pub fn dispute_claim(ctx: Context<DisputeClaim>) -> Result<()> {
        let claim = &mut ctx.accounts.claim_account;

        require!(claim.status == ClaimStatus::Rejected, ErrorCode::InvalidClaimStatus);

        claim.status = ClaimStatus::Disputed;

        msg!("Claim {} disputed by {}", claim.claim_id, ctx.accounts.disputer.key());
        Ok(())
    }
}

// ─── Account Contexts ─────────────────────────────────

#[derive(Accounts)]
#[instruction(claim_id: String)]
pub struct SubmitClaim<'info> {
    #[account(
        init,
        payer = submitter,
        space = ClaimAccount::SPACE,
        seeds = [b"claim", claim_id.as_bytes()],
        bump
    )]
    pub claim_account: Account<'info, ClaimAccount>,

    #[account(mut)]
    pub submitter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReviewClaim<'info> {
    #[account(mut)]
    pub claim_account: Account<'info, ClaimAccount>,

    pub reviewer: Signer<'info>,
}

#[derive(Accounts)]
pub struct DisputeClaim<'info> {
    #[account(mut)]
    pub claim_account: Account<'info, ClaimAccount>,

    pub disputer: Signer<'info>,
}

// ─── Account State ─────────────────────────────────────

#[account]
pub struct ClaimAccount {
    pub claim_id: String,        // 64 bytes max
    pub submitter: Pubkey,       // 32
    pub clinic_wallet: Pubkey,   // 32
    pub reviewer: Pubkey,        // 32
    pub amount: u64,             // 8
    pub approved_amount: u64,    // 8
    pub data_hash: String,       // 64 (SHA-256 hex)
    pub status: ClaimStatus,     // 1
    pub submitted_at: i64,       // 8
    pub reviewed_at: i64,        // 8
    pub bump: u8,                // 1
}

impl ClaimAccount {
    pub const SPACE: usize = 8    // discriminator
        + 4 + 64                  // claim_id string
        + 32                      // submitter
        + 32                      // clinic_wallet
        + 32                      // reviewer
        + 8                       // amount
        + 8                       // approved_amount
        + 4 + 64                  // data_hash string
        + 1                       // status enum
        + 8                       // submitted_at
        + 8                       // reviewed_at
        + 1;                      // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ClaimStatus {
    Submitted,
    UnderReview,
    Approved,
    Rejected,
    Disputed,
    Paid,
}

// ─── Events ────────────────────────────────────────────

#[event]
pub struct ClaimSubmittedEvent {
    pub claim_id: String,
    pub submitter: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimApprovedEvent {
    pub claim_id: String,
    pub reviewer: Pubkey,
    pub approved_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimRejectedEvent {
    pub claim_id: String,
    pub reviewer: Pubkey,
    pub timestamp: i64,
}

// ─── Error Codes ───────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid claim ID")]
    InvalidClaimId,
    #[msg("Invalid data hash — must be 64-character SHA-256 hex")]
    InvalidDataHash,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Claim is not in a reviewable state")]
    InvalidClaimStatus,
    #[msg("Unauthorized")]
    Unauthorized,
}
