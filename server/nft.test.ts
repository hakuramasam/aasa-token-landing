import { beforeEach, describe, expect, it, vi } from "vitest";

const { createNftDraftMock, createNftPaymentPlanMock, createNftRewardEpochMock, listNftDraftsMock, storagePutMock } = vi.hoisted(() => ({
  createNftDraftMock: vi.fn(),
  createNftPaymentPlanMock: vi.fn(),
  createNftRewardEpochMock: vi.fn(),
  listNftDraftsMock: vi.fn(),
  storagePutMock: vi.fn(),
}));

vi.mock("./db", () => ({
  createNftDraft: createNftDraftMock,
  createNftPaymentPlan: createNftPaymentPlanMock,
  createNftRewardEpoch: createNftRewardEpochMock,
  listNftDraftsForUser: listNftDraftsMock,
}));

vi.mock("./storage", () => ({ storagePut: storagePutMock }));

import { MAX_ARTWORK_BYTES, parseArtworkDataUrl, saveNftDraft } from "./nft";

describe("NFT artwork validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createNftDraftMock.mockResolvedValue(44);
    createNftPaymentPlanMock.mockResolvedValue(88);
  });
  it("accepts a matching PNG data URL", () => {
    const bytes = parseArtworkDataUrl("data:image/png;base64,aGVsbG8=", "image/png");
    expect(bytes.toString()).toBe("hello");
  });

  it("rejects a mismatched declared mime type", () => {
    expect(() => parseArtworkDataUrl("data:image/jpeg;base64,aGVsbG8=", "image/png")).toThrow(
      "does not match",
    );
  });

  it("rejects artwork beyond the upload ceiling", () => {
    const oversized = Buffer.alloc(MAX_ARTWORK_BYTES + 1).toString("base64");
    expect(() => parseArtworkDataUrl(`data:image/png;base64,${oversized}`, "image/png")).toThrow(
      "no larger than 10 MB",
    );
  });

  it("saves a mint-prepared draft to storage and the database without a chain transaction", async () => {
    storagePutMock.mockResolvedValue({ key: "nft-drafts/7/artwork_a1b2c3.png", url: "/manus-storage/nft-drafts/7/artwork_a1b2c3.png" });

    const result = await saveNftDraft({
      userId: 7,
      artworkDataUrl: "data:image/png;base64,aGVsbG8=",
      artworkMimeType: "image/png",
      artworkName: "signal.png",
      title: "AASA Signal #001",
      description: "Creator test draft",
      attributes: [{ traitType: "Signal", value: "Authorized" }],
      walletAddress: "0x1111111111111111111111111111111111111111",
      paymentTier: "staking_ready",
    });

    expect(storagePutMock).toHaveBeenCalledWith(
      "nft-drafts/7/artwork.png",
      expect.any(Buffer),
      "image/png",
    );
    expect(createNftDraftMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: 7,
      artworkKey: "nft-drafts/7/artwork_a1b2c3.png",
      status: "mint_prepared",
      walletAddress: "0x1111111111111111111111111111111111111111",
    }));
    expect(result.artworkUrl).toBe("/manus-storage/nft-drafts/7/artwork_a1b2c3.png");
    expect(createNftPaymentPlanMock).toHaveBeenCalledWith(expect.objectContaining({
      nftDraftId: 44,
      paymentStatus: "preparation_only",
      treasuryActionStatus: "treasury_setup_required",
      feeAasa: "100000",
      rewardReserveAasa: "20000",
      rewardAllocationBps: 2000,
      rewardTokenSymbol: "BPAD",
      policyVersion: "aasa-payment-policy-v1",
      paymentMemo: expect.stringMatching(/^AASA-NFT:aasa-/),
      approvalThreshold: 2,
      approvalSignerCount: 3,
      maxSlippageBps: 200,
    }));
    expect(createNftRewardEpochMock).toHaveBeenCalledWith(expect.objectContaining({
      nftPaymentPlanId: 88,
      rewardReserveAasa: "20000",
      rewardTokenSymbol: "BPAD",
      status: "preparation_only",
    }));
    expect(result.paymentPlan.paymentOrderId).toMatch(/^aasa-/);
    expect(result.paymentPlan.criteria).toContain("monthly_eligibility_published");
    expect(result.paymentPlan.guardrails).toMatchObject({ approvalThreshold: 2, maxSlippageBps: 200 });
  });
});
