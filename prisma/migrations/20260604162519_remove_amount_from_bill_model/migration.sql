/*
  Warnings:

  - You are about to drop the column `amount` on the `Bills` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bills" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "external_id" TEXT NOT NULL,
    "invoice_date" DATETIME NOT NULL,
    "posting_date" DATETIME NOT NULL,
    "due_date" DATETIME,
    "description" TEXT,
    "currency" TEXT NOT NULL,
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "vendor_id" BIGINT NOT NULL,
    "ap_account_id" BIGINT NOT NULL,
    CONSTRAINT "Bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bills_ap_account_id_fkey" FOREIGN KEY ("ap_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bills" ("ap_account_id", "currency", "description", "due_date", "external_id", "id", "inactive", "invoice_date", "posting_date", "vendor_id") SELECT "ap_account_id", "currency", "description", "due_date", "external_id", "id", "inactive", "invoice_date", "posting_date", "vendor_id" FROM "Bills";
DROP TABLE "Bills";
ALTER TABLE "new_Bills" RENAME TO "Bills";
CREATE UNIQUE INDEX "Bills_external_id_key" ON "Bills"("external_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
