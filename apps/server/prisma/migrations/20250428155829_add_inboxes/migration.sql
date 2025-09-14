-- CreateTable
CREATE TABLE "SpaceInbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "authPolicy" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "encryptedSecretKey" TEXT NOT NULL,
    "spaceEventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpaceInbox_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpaceInbox_spaceEventId_fkey" FOREIGN KEY ("spaceEventId") REFERENCES "SpaceEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpaceInboxMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceInboxId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "signatureHex" TEXT,
    "signatureRecovery" INTEGER,
    "authorAccountAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpaceInboxMessage_spaceInboxId_fkey" FOREIGN KEY ("spaceInboxId") REFERENCES "SpaceInbox" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountInbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountAddress" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "authPolicy" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "signatureHex" TEXT NOT NULL,
    "signatureRecovery" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountInbox_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountInboxMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountInboxId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "signatureHex" TEXT,
    "signatureRecovery" INTEGER,
    "authorAccountAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountInboxMessage_accountInboxId_fkey" FOREIGN KEY ("accountInboxId") REFERENCES "AccountInbox" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
