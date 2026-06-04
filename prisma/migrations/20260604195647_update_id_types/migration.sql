/*
  Warnings:

  - The primary key for the `BillLineItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `bill_id` on the `BillLineItems` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `BillLineItems` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `ledger_account_id` on the `BillLineItems` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Bills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ap_account_id` on the `Bills` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `Bills` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `vendor_id` on the `Bills` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `LedgerAccounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `LedgerAccounts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `bill_id` on the `Payments` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `Payments` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `ledger_account_id` on the `Payments` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Vendors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `expense_account_id` on the `Vendors` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `Vendors` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BillLineItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "line_type" TEXT NOT NULL DEFAULT 'expense',
    "description" TEXT,
    "amount" DECIMAL NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "tax_amount" DECIMAL,
    "bill_id" INTEGER NOT NULL,
    "ledger_account_id" INTEGER NOT NULL,
    CONSTRAINT "BillLineItems_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BillLineItems_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BillLineItems" ("amount", "bill_id", "description", "external_id", "id", "ledger_account_id", "line_type", "quantity", "tax_amount") SELECT "amount", "bill_id", "description", "external_id", "id", "ledger_account_id", "line_type", "quantity", "tax_amount" FROM "BillLineItems";
DROP TABLE "BillLineItems";
ALTER TABLE "new_BillLineItems" RENAME TO "BillLineItems";
CREATE UNIQUE INDEX "BillLineItems_external_id_key" ON "BillLineItems"("external_id");
CREATE TABLE "new_Bills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "invoice_date" DATETIME NOT NULL,
    "posting_date" DATETIME NOT NULL,
    "due_date" DATETIME,
    "description" TEXT,
    "currency" TEXT NOT NULL,
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "vendor_id" INTEGER NOT NULL,
    "ap_account_id" INTEGER NOT NULL,
    CONSTRAINT "Bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bills_ap_account_id_fkey" FOREIGN KEY ("ap_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bills" ("ap_account_id", "currency", "description", "due_date", "external_id", "id", "inactive", "invoice_date", "posting_date", "vendor_id") SELECT "ap_account_id", "currency", "description", "due_date", "external_id", "id", "inactive", "invoice_date", "posting_date", "vendor_id" FROM "Bills";
DROP TABLE "Bills";
ALTER TABLE "new_Bills" RENAME TO "Bills";
CREATE UNIQUE INDEX "Bills_external_id_key" ON "Bills"("external_id");
CREATE TABLE "new_LedgerAccounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "natural_balance" TEXT NOT NULL,
    "description" TEXT,
    "inactive" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_LedgerAccounts" ("description", "external_id", "id", "inactive", "name", "natural_balance", "number", "subtype", "type") SELECT "description", "external_id", "id", "inactive", "name", "natural_balance", "number", "subtype", "type" FROM "LedgerAccounts";
DROP TABLE "LedgerAccounts";
ALTER TABLE "new_LedgerAccounts" RENAME TO "LedgerAccounts";
CREATE UNIQUE INDEX "LedgerAccounts_external_id_key" ON "LedgerAccounts"("external_id");
CREATE TABLE "new_Payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "payment_date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "check_number" TEXT,
    "memo" TEXT,
    "bill_id" INTEGER NOT NULL,
    "ledger_account_id" INTEGER NOT NULL,
    CONSTRAINT "Payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payments_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payments" ("amount", "bill_id", "check_number", "external_id", "id", "ledger_account_id", "memo", "payment_date", "type") SELECT "amount", "bill_id", "check_number", "external_id", "id", "ledger_account_id", "memo", "payment_date", "type" FROM "Payments";
DROP TABLE "Payments";
ALTER TABLE "new_Payments" RENAME TO "Payments";
CREATE UNIQUE INDEX "Payments_external_id_key" ON "Payments"("external_id");
CREATE UNIQUE INDEX "Payments_external_id_bill_id_key" ON "Payments"("external_id", "bill_id");
CREATE TABLE "new_Vendors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "ein" TEXT,
    "is_1099" BOOLEAN NOT NULL DEFAULT false,
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "address_city" TEXT,
    "address_state" TEXT,
    "address_zip" TEXT,
    "address_country" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "expense_account_id" INTEGER,
    CONSTRAINT "Vendors_expense_account_id_fkey" FOREIGN KEY ("expense_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vendors" ("address_city", "address_country", "address_line_1", "address_line_2", "address_state", "address_zip", "contact_email", "contact_name", "contact_phone", "ein", "email", "expense_account_id", "external_id", "id", "inactive", "is_1099", "name") SELECT "address_city", "address_country", "address_line_1", "address_line_2", "address_state", "address_zip", "contact_email", "contact_name", "contact_phone", "ein", "email", "expense_account_id", "external_id", "id", "inactive", "is_1099", "name" FROM "Vendors";
DROP TABLE "Vendors";
ALTER TABLE "new_Vendors" RENAME TO "Vendors";
CREATE UNIQUE INDEX "Vendors_external_id_key" ON "Vendors"("external_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
