import { randomUUID } from "node:crypto";
import { createNftDraft, createNftPaymentPlan, createNftRewardEpoch, listNftDraftsForUser } from "./db";
import { storagePut } from "./storage";

export const ALLOWED_ARTWORK_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
export type ArtworkMimeType = (typeof ALLOWED_ARTWORK_TYPES)[number];
export const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

export const PAYMENT_TIERS = {
  standard: { feeAasa: "10000", rewardReserveAasa: "2000", label: "R1 / Standard" },
  curated: { feeAasa: "25000", rewardReserveAasa: "5000", label: "R2 / Curated" },
  staking_ready: { feeAasa: "100000", rewardReserveAasa: "20000", label: "R3 / Staking-ready" },
  ecosystem: { feeAasa: "500000", rewardReserveAasa: "100000", label: "R4 / Ecosystem" },
  protocol_partner: { feeAasa: "1000000", rewardReserveAasa: "200000", label: "R5 / Protocol partner" },
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;
export const BPAD_REWARD_TOKEN = {
  symbol: "BPAD",
  address: "0xf5F11BC9Be9D6690f795D04d2fc9bdd097008a2B",
} as const;
export const REWARD_ALLOCATION_BPS = 2000;
export const PAYMENT_POLICY_VERSION = "aasa-payment-policy-v1";
export const TREASURY_GUARDRAILS = {
  approvalThreshold: 2,
  approvalSignerCount: 3,
  approvalCadence: "monthly" as const,
  proposalExpiryHours: 72,
  maxSlippageBps: 200,
};
export const TIER_CRITERIA: Record<PaymentTier, string[]> = {
  standard: ["creator_account_verified", "metadata_complete", "recipient_wallet_connected"],
  curated: ["standard_criteria", "rights_acknowledgement", "verified_reward_token"],
  staking_ready: ["curated_criteria", "monthly_eligibility_published", "staking_integration_reviewed"],
  ecosystem: ["staking_ready_criteria", "ecosystem_integration_approved", "monthly_reporting_committed"],
  protocol_partner: ["ecosystem_criteria", "safe_approval_recorded", "contract_review_complete", "risk_disclosure_published"],
};

const extensionByType: Record<ArtworkMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function parseArtworkDataUrl(dataUrl: string, mimeType: ArtworkMimeType): Buffer {
  const dataUrlMatch = dataUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!dataUrlMatch || dataUrlMatch[1] !== mimeType) {
    throw new Error("Artwork data does not match its declared image type");
  }

  const bytes = Buffer.from(dataUrlMatch[2].replace(/\s/g, ""), "base64");
  if (bytes.length === 0 || bytes.length > MAX_ARTWORK_BYTES) {
    throw new Error("Artwork must be an image no larger than 10 MB");
  }
  return bytes;
}

export async function saveNftDraft(input: {
  userId: number;
  artworkDataUrl: string;
  artworkMimeType: ArtworkMimeType;
  artworkName: string;
  title: string;
  description?: string | null;
  attributes: Array<{ traitType: string; value: string }>;
  walletAddress?: string | null;
  paymentTier: PaymentTier;
}) {
  const bytes = parseArtworkDataUrl(input.artworkDataUrl, input.artworkMimeType);
  const extension = extensionByType[input.artworkMimeType];
  const { key, url } = await storagePut(
    `nft-drafts/${input.userId}/artwork.${extension}`,
    bytes,
    input.artworkMimeType,
  );

  const nftDraftId = await createNftDraft({
    userId: input.userId,
    artworkKey: key,
    artworkUrl: url,
    artworkName: input.artworkName,
    artworkMimeType: input.artworkMimeType,
    title: input.title,
    description: input.description || null,
    attributesJson: JSON.stringify(input.attributes),
    walletAddress: input.walletAddress || null,
    status: "mint_prepared",
  });

  const paymentTier = PAYMENT_TIERS[input.paymentTier];
  const paymentOrderId = `aasa-${randomUUID()}`;
  const paymentMemo = `AASA-NFT:${paymentOrderId}`;
  const paymentPlanId = await createNftPaymentPlan({
    nftDraftId,
    userId: input.userId,
    paymentOrderId,
    feeTier: input.paymentTier,
    feeAasa: paymentTier.feeAasa,
    rewardReserveAasa: paymentTier.rewardReserveAasa,
    rewardAllocationBps: REWARD_ALLOCATION_BPS,
    rewardCadence: "monthly",
    rewardTokenSymbol: BPAD_REWARD_TOKEN.symbol,
    rewardTokenAddress: BPAD_REWARD_TOKEN.address,
    policyVersion: PAYMENT_POLICY_VERSION,
    criteriaSnapshotJson: JSON.stringify(TIER_CRITERIA[input.paymentTier]),
    paymentMemo,
    approvalThreshold: TREASURY_GUARDRAILS.approvalThreshold,
    approvalSignerCount: TREASURY_GUARDRAILS.approvalSignerCount,
    approvalCadence: TREASURY_GUARDRAILS.approvalCadence,
    proposalExpiryHours: TREASURY_GUARDRAILS.proposalExpiryHours,
    maxSlippageBps: TREASURY_GUARDRAILS.maxSlippageBps,
    paymentStatus: "preparation_only",
    treasuryActionStatus: "treasury_setup_required",
  });
  const epochKey = new Date().toISOString().slice(0, 7);
  await createNftRewardEpoch({
    nftPaymentPlanId: paymentPlanId,
    epochKey,
    rewardReserveAasa: paymentTier.rewardReserveAasa,
    rewardTokenSymbol: BPAD_REWARD_TOKEN.symbol,
    rewardTokenAddress: BPAD_REWARD_TOKEN.address,
    status: "preparation_only",
  });

  return {
    artworkUrl: url,
    artworkKey: key,
    paymentPlan: {
      paymentOrderId,
      feeTier: input.paymentTier,
      feeAasa: paymentTier.feeAasa,
      rewardReserveAasa: paymentTier.rewardReserveAasa,
      rewardAllocationBps: REWARD_ALLOCATION_BPS,
      rewardCadence: "monthly" as const,
      rewardTokenSymbol: BPAD_REWARD_TOKEN.symbol,
      paymentMemo,
      policyVersion: PAYMENT_POLICY_VERSION,
      criteria: TIER_CRITERIA[input.paymentTier],
      epochKey,
      guardrails: TREASURY_GUARDRAILS,
      treasuryActionStatus: "treasury_setup_required" as const,
    },
  };
}

export async function getNftDrafts(userId: number) {
  return listNftDraftsForUser(userId);
}
