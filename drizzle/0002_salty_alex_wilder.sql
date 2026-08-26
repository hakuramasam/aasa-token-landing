CREATE TABLE `nftRewardEpochs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nftPaymentPlanId` int NOT NULL,
	`epochKey` varchar(16) NOT NULL,
	`rewardReserveAasa` varchar(32) NOT NULL,
	`rewardTokenSymbol` varchar(24) NOT NULL,
	`rewardTokenAddress` varchar(64) NOT NULL,
	`eligibilitySnapshotRef` varchar(512),
	`distributionProof` varchar(512),
	`status` enum('preparation_only','snapshot_pending','funding_pending','distribution_pending','distributed') NOT NULL DEFAULT 'preparation_only',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nftRewardEpochs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `policyVersion` varchar(64) DEFAULT 'aasa-payment-policy-v1' NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `criteriaSnapshotJson` varchar(2048) DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `paymentMemo` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `settlementProof` varchar(512);--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `approvalThreshold` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `approvalSignerCount` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `approvalCadence` enum('monthly') DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `proposalExpiryHours` int DEFAULT 72 NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD `maxSlippageBps` int DEFAULT 200 NOT NULL;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD CONSTRAINT `nftPaymentPlans_paymentMemo_unique` UNIQUE(`paymentMemo`);--> statement-breakpoint
ALTER TABLE `nftRewardEpochs` ADD CONSTRAINT `nftRewardEpochs_nftPaymentPlanId_nftPaymentPlans_id_fk` FOREIGN KEY (`nftPaymentPlanId`) REFERENCES `nftPaymentPlans`(`id`) ON DELETE no action ON UPDATE no action;