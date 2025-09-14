/*
  Warnings:

  - You are about to drop the `Identity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccountToSpace` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `sessionNonce` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `sessionTokenExpires` on the `Account` table. All the data in the column will be lost.
  - Added the required column `address` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectAccountProof` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectAddress` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectCiphertext` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectEncryptionPublicKey` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectKeyProof` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectNonce` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectSignaturePublicKey` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infoAuthorAddress` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infoContent` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infoSignatureHex` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `infoSignatureRecovery` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_AccountToSpace_B_index";

-- DropIndex
DROP INDEX "_AccountToSpace_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Identity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_AccountToSpace";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AppIdentity" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "InvitationTargetApp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    CONSTRAINT "InvitationTargetApp_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_space-members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_space-members_A_fkey" FOREIGN KEY ("A") REFERENCES "Account" ("address") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_space-members_B_fkey" FOREIGN KEY ("B") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AppIdentityToSpace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AppIdentityToSpace_A_fkey" FOREIGN KEY ("A") REFERENCES "AppIdentity" ("address") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AppIdentityToSpace_B_fkey" FOREIGN KEY ("B") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "connectKeyProof" TEXT NOT NULL
);
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_connectAddress_key" ON "Account"("connectAddress");
CREATE TABLE "new_AccountInbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountAddress" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "authPolicy" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "signatureHex" TEXT NOT NULL,
    "signatureRecovery" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountInbox_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccountInbox" ("accountAddress", "authPolicy", "createdAt", "encryptionPublicKey", "id", "isPublic", "signatureHex", "signatureRecovery") SELECT "accountAddress", "authPolicy", "createdAt", "encryptionPublicKey", "id", "isPublic", "signatureHex", "signatureRecovery" FROM "AccountInbox";
DROP TABLE "AccountInbox";
ALTER TABLE "new_AccountInbox" RENAME TO "AccountInbox";
CREATE TABLE "new_Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceId" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "inviteeAccountAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invitation" ("accountAddress", "createdAt", "id", "inviteeAccountAddress", "spaceId") SELECT "accountAddress", "createdAt", "id", "inviteeAccountAddress", "spaceId" FROM "Invitation";
DROP TABLE "Invitation";
ALTER TABLE "new_Invitation" RENAME TO "Invitation";
CREATE UNIQUE INDEX "Invitation_spaceId_inviteeAccountAddress_key" ON "Invitation"("spaceId", "inviteeAccountAddress");
CREATE TABLE "new_Space" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "infoContent" BLOB NOT NULL,
    "infoAuthorAddress" TEXT NOT NULL,
    "infoSignatureHex" TEXT NOT NULL,
    "infoSignatureRecovery" INTEGER NOT NULL,
    CONSTRAINT "Space_infoAuthorAddress_fkey" FOREIGN KEY ("infoAuthorAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Space" ("id") SELECT "id" FROM "Space";
DROP TABLE "Space";
ALTER TABLE "new_Space" RENAME TO "Space";
CREATE TABLE "new_SpaceKeyBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceKeyId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "authorPublicKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountAddress" TEXT NOT NULL,
    "appIdentityAddress" TEXT,
    CONSTRAINT "SpaceKeyBox_spaceKeyId_fkey" FOREIGN KEY ("spaceKeyId") REFERENCES "SpaceKey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpaceKeyBox_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpaceKeyBox_appIdentityAddress_fkey" FOREIGN KEY ("appIdentityAddress") REFERENCES "AppIdentity" ("address") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SpaceKeyBox" ("accountAddress", "authorPublicKey", "ciphertext", "createdAt", "id", "nonce", "spaceKeyId") SELECT "accountAddress", "authorPublicKey", "ciphertext", "createdAt", "id", "nonce", "spaceKeyId" FROM "SpaceKeyBox";
DROP TABLE "SpaceKeyBox";
ALTER TABLE "new_SpaceKeyBox" RENAME TO "SpaceKeyBox";
CREATE UNIQUE INDEX "SpaceKeyBox_spaceKeyId_nonce_key" ON "SpaceKeyBox"("spaceKeyId", "nonce");
CREATE TABLE "new_Update" (
    "spaceId" TEXT NOT NULL,
    "clock" INTEGER NOT NULL,
    "content" BLOB NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "signatureHex" TEXT NOT NULL,
    "signatureRecovery" INTEGER NOT NULL,
    "updateId" TEXT NOT NULL,

    PRIMARY KEY ("spaceId", "clock"),
    CONSTRAINT "Update_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Update_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Update" ("accountAddress", "clock", "content", "signatureHex", "signatureRecovery", "spaceId", "updateId") SELECT "accountAddress", "clock", "content", "signatureHex", "signatureRecovery", "spaceId", "updateId" FROM "Update";
DROP TABLE "Update";
ALTER TABLE "new_Update" RENAME TO "Update";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AppIdentity_sessionToken_idx" ON "AppIdentity"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "AppIdentity_accountAddress_appId_key" ON "AppIdentity"("accountAddress", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "AppIdentity_accountAddress_nonce_key" ON "AppIdentity"("accountAddress", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "_space-members_AB_unique" ON "_space-members"("A", "B");

-- CreateIndex
CREATE INDEX "_space-members_B_index" ON "_space-members"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AppIdentityToSpace_AB_unique" ON "_AppIdentityToSpace"("A", "B");

-- CreateIndex
CREATE INDEX "_AppIdentityToSpace_B_index" ON "_AppIdentityToSpace"("B");
