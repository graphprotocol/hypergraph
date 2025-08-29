/*
  Warnings:

  - Added the required column `counter` to the `SpaceEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `SpaceEvent` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpaceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "spaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpaceEvent_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SpaceEvent" ("event", "id", "spaceId") SELECT "event", "id", "spaceId" FROM "SpaceEvent";
DROP TABLE "SpaceEvent";
ALTER TABLE "new_SpaceEvent" RENAME TO "SpaceEvent";
CREATE UNIQUE INDEX "SpaceEvent_spaceId_counter_key" ON "SpaceEvent"("spaceId", "counter");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
