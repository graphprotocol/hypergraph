-- CreateTable
CREATE TABLE "Identity" (
    "accountId" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "signaturePublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "accountProof" TEXT NOT NULL,
    "keyProof" TEXT NOT NULL,

    PRIMARY KEY ("accountId", "nonce"),
    CONSTRAINT "Identity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
