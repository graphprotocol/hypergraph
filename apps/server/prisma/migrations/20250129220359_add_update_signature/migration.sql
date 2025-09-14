/*
  Warnings:

  - Added the required column `accountAddress` to the `Update` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateId` to the `Update` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatureHex` to the `Update` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatureRecovery` to the `Update` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "Update_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Update" ("clock", "content", "spaceId") SELECT "clock", "content", "spaceId" FROM "Update";
DROP TABLE "Update";
ALTER TABLE "new_Update" RENAME TO "Update";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
