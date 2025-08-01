-- CreateTable
CREATE TABLE "Update" (
    "spaceId" TEXT NOT NULL,
    "clock" INTEGER NOT NULL,
    "content" BLOB NOT NULL,

    PRIMARY KEY ("spaceId", "clock"),
    CONSTRAINT "Update_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
