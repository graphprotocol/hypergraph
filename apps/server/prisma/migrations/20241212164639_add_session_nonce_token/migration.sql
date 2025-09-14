-- AlterTable
ALTER TABLE "Account" ADD COLUMN "sessionNonce" TEXT;
ALTER TABLE "Account" ADD COLUMN "sessionToken" TEXT;
ALTER TABLE "Account" ADD COLUMN "sessionTokenExpires" DATETIME;
