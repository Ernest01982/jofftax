CREATE TABLE `preparations` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`assessment_year` integer NOT NULL,
	`schema_version` integer NOT NULL,
	`rules_version` text NOT NULL,
	`answers_json` text NOT NULL,
	`checklist_json` text NOT NULL,
	`revision` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `preparations_owner_year` ON `preparations` (`owner_id`,`assessment_year`);