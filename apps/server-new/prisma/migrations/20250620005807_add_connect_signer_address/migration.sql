/*
  Warnings:

  - Added the required column `connectSignerAddress` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "connectAddress" TEXT NOT NULL,
    "connectCiphertext" TEXT NOT NULL,
    "connectNonce" TEXT NOT NULL,
    "connectSignaturePublicKey" TEXT NOT NULL,
    "connectEncryptionPublicKey" TEXT NOT NULL,
    "connectAccountProof" TEXT NOT NULL,
    "connectKeyProof" TEXT NOT NULL,
    "connectSignerAddress" TEXT NOT NULL
);
INSERT INTO "new_Account" ("address", "connectAccountProof", "connectAddress", "connectCiphertext", "connectEncryptionPublicKey", "connectKeyProof", "connectNonce", "connectSignaturePublicKey") SELECT "address", "connectAccountProof", "connectAddress", "connectCiphertext", "connectEncryptionPublicKey", "connectKeyProof", "connectNonce", "connectSignaturePublicKey" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_connectAddress_key" ON "Account"("connectAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
