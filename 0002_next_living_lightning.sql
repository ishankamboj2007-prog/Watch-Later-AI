CREATE TABLE `collectionVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`videoId` int NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collectionVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(7) NOT NULL DEFAULT '#8B5CF6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shareLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(64) NOT NULL,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shareLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `shareLinks_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `videoMoods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`mood` enum('learn','entertainment','quick_watch','deep_dive','revisit_later') NOT NULL,
	`score` int NOT NULL DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoMoods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `videos` ADD `watchStatus` enum('unwatched','in_progress','watched') DEFAULT 'unwatched' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `userNotes` text;