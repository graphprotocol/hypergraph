/*
  Warnings:

  - You are about to drop the column `nonce` on the `AppIdentity` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppIdentity" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "ciphertext" TEXT NOT NULL,
    "signaturePublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "accountProof" TEXT NOT NULL,
    "keyProof" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "sessionTokenExpires" DATETIME NOT NULL,
    CONSTRAINT "AppIdentity_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppIdentity" ("accountAddress", "accountProof", "address", "appId", "ciphertext", "encryptionPublicKey", "keyProof", "sessionToken", "sessionTokenExpires", "signaturePublicKey") SELECT "accountAddress", "accountProof", "address", "appId", "ciphertext", "encryptionPublicKey", "keyProof", "sessionToken", "sessionTokenExpires", "signaturePublicKey" FROM "AppIdentity";
DROP TABLE "AppIdentity";
ALTER TABLE "new_AppIdentity" RENAME TO "AppIdentity";
CREATE INDEX "AppIdentity_sessionToken_idx" ON "AppIdentity"("sessionToken");
CREATE UNIQUE INDEX "AppIdentity_accountAddress_appId_key" ON "AppIdentity"("accountAddress", "appId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
