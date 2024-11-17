-- CreateTable
CREATE TABLE "SpaceKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpaceKey_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpaceKeyBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceKeyId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "authorPublicKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpaceKeyBox_spaceKeyId_fkey" FOREIGN KEY ("spaceKeyId") REFERENCES "SpaceKey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpaceKeyBox_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
