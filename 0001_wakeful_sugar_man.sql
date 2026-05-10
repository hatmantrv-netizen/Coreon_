CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`coverUrl` text,
	`coverKey` text,
	`fileUrl` text,
	`fileKey` text,
	`fileType` varchar(32),
	`playUrl` text,
	`category` varchar(64) NOT NULL DEFAULT 'Autre',
	`tags` text,
	`authorId` int NOT NULL,
	`views` bigint NOT NULL DEFAULT 0,
	`downloads` bigint NOT NULL DEFAULT 0,
	`published` enum('draft','published') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screenshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameId` int NOT NULL,
	`url` text NOT NULL,
	`storageKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `screenshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_downloads_id` PRIMARY KEY(`id`)
);
