ALTER TABLE "user" ALTER COLUMN "name" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "normalized_email" text;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_normalized_email_unique" UNIQUE("normalized_email");