CREATE TABLE `nftPaymentPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nftDraftId` int NOT NULL,
	`userId` int NOT NULL,
	`paymentOrderId` varchar(64) NOT NULL,
	`feeTier` enum('standard','curated','staking_ready','ecosystem','protocol_partner') NOT NULL,
	`feeAasa` varchar(32) NOT NULL,
	`rewardReserveAasa` varchar(32) NOT NULL,
	`rewardAllocationBps` int NOT NULL,
	`rewardCadence` enum('monthly') NOT NULL,
	`rewardTokenSymbol` varchar(24) NOT NULL,
	`rewardTokenAddress` varchar(64) NOT NULL,
	`paymentStatus` enum('preparation_only','payment_pending','settled') NOT NULL DEFAULT 'preparation_only',
	`treasuryActionStatus` enum('treasury_setup_required','approval_required','approved','executed') NOT NULL DEFAULT 'treasury_setup_required',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nftPaymentPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `nftPaymentPlans_paymentOrderId_unique` UNIQUE(`paymentOrderId`)
);
--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD CONSTRAINT `nftPaymentPlans_nftDraftId_nftDrafts_id_fk` FOREIGN KEY (`nftDraftId`) REFERENCES `nftDrafts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nftPaymentPlans` ADD CONSTRAINT `nftPaymentPlans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;