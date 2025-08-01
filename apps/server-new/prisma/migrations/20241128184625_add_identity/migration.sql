-- CreateTable
CREATE TABLE "Identity" (
    "accountAddress" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "signaturePublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "accountProof" TEXT NOT NULL,
    "keyProof" TEXT NOT NULL,

    PRIMARY KEY ("accountAddress", "nonce"),
    CONSTRAINT "Identity_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
