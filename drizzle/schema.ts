import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Creator-owned NFT records. Image bytes stay in S3; this table holds only the
 * storage location and artist-supplied metadata needed to reopen a draft.
 */
export const nftDrafts = mysqlTable("nftDrafts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  artworkKey: varchar("artworkKey", { length: 512 }).notNull(),
  artworkUrl: varchar("artworkUrl", { length: 768 }).notNull(),
  artworkName: varchar("artworkName", { length: 255 }).notNull(),
  artworkMimeType: varchar("artworkMimeType", { length: 100 }).notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description"),
  attributesJson: text("attributesJson").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }),
  status: mysqlEnum("status", ["draft", "mint_prepared"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NftDraft = typeof nftDrafts.$inferSelect;
export type InsertNftDraft = typeof nftDrafts.$inferInsert;

/**
 * Immutable-at-creation payment preparation records. They describe a selected
 * $AASA fee tier and its reward reserve, but never represent a payment, swap,
 * approval, token purchase, or on-chain treasury action.
 */
export const nftPaymentPlans = mysqlTable("nftPaymentPlans", {
  id: int("id").autoincrement().primaryKey(),
  nftDraftId: int("nftDraftId").notNull().references(() => nftDrafts.id),
  userId: int("userId").notNull().references(() => users.id),
  paymentOrderId: varchar("paymentOrderId", { length: 64 }).notNull().unique(),
  feeTier: mysqlEnum("feeTier", ["standard", "curated", "staking_ready", "ecosystem", "protocol_partner"]).notNull(),
  feeAasa: varchar("feeAasa", { length: 32 }).notNull(),
  rewardReserveAasa: varchar("rewardReserveAasa", { length: 32 }).notNull(),
  rewardAllocationBps: int("rewardAllocationBps").notNull(),
  rewardCadence: mysqlEnum("rewardCadence", ["monthly"]).notNull(),
  rewardTokenSymbol: varchar("rewardTokenSymbol", { length: 24 }).notNull(),
  rewardTokenAddress: varchar("rewardTokenAddress", { length: 64 }).notNull(),
  policyVersion: varchar("policyVersion", { length: 64 }).default("aasa-payment-policy-v1").notNull(),
  criteriaSnapshotJson: varchar("criteriaSnapshotJson", { length: 2048 }).default("[]").notNull(),
  paymentMemo: varchar("paymentMemo", { length: 128 }).notNull().unique(),
  settlementProof: varchar("settlementProof", { length: 512 }),
  approvalThreshold: int("approvalThreshold").default(2).notNull(),
  approvalSignerCount: int("approvalSignerCount").default(3).notNull(),
  approvalCadence: mysqlEnum("approvalCadence", ["monthly"]).default("monthly").notNull(),
  proposalExpiryHours: int("proposalExpiryHours").default(72).notNull(),
  maxSlippageBps: int("maxSlippageBps").default(200).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["preparation_only", "payment_pending", "settled"]).default("preparation_only").notNull(),
  treasuryActionStatus: mysqlEnum("treasuryActionStatus", ["treasury_setup_required", "approval_required", "approved", "executed"]).default("treasury_setup_required").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NftPaymentPlan = typeof nftPaymentPlans.$inferSelect;
export type InsertNftPaymentPlan = typeof nftPaymentPlans.$inferInsert;

/**
 * Preparation-only monthly reward cycles. A future verified distributor may
 * attach snapshot and distribution proof data, but this table cannot fund or
 * distribute any asset by itself.
 */
export const nftRewardEpochs = mysqlTable("nftRewardEpochs", {
  id: int("id").autoincrement().primaryKey(),
  nftPaymentPlanId: int("nftPaymentPlanId").notNull().references(() => nftPaymentPlans.id),
  epochKey: varchar("epochKey", { length: 16 }).notNull(),
  rewardReserveAasa: varchar("rewardReserveAasa", { length: 32 }).notNull(),
  rewardTokenSymbol: varchar("rewardTokenSymbol", { length: 24 }).notNull(),
  rewardTokenAddress: varchar("rewardTokenAddress", { length: 64 }).notNull(),
  eligibilitySnapshotRef: varchar("eligibilitySnapshotRef", { length: 512 }),
  distributionProof: varchar("distributionProof", { length: 512 }),
  status: mysqlEnum("status", ["preparation_only", "snapshot_pending", "funding_pending", "distribution_pending", "distributed"]).default("preparation_only").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NftRewardEpoch = typeof nftRewardEpochs.$inferSelect;
export type InsertNftRewardEpoch = typeof nftRewardEpochs.$inferInsert;
