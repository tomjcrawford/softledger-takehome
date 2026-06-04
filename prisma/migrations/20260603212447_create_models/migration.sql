-- CreateTable
CREATE TABLE "LedgerAccounts" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "natural_balance" TEXT NOT NULL,
    "description" TEXT,
    "inactive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Vendors" (
    "id" BIGINT NOT NULL PRIMARY KEY,
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
    "expense_account_id" BIGINT,
    CONSTRAINT "Vendors_expense_account_id_fkey" FOREIGN KEY ("expense_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bills" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "external_id" TEXT NOT NULL,
    "invoice_date" DATETIME NOT NULL,
    "posting_date" DATETIME NOT NULL,
    "due_date" DATETIME,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL,
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "vendor_id" BIGINT NOT NULL,
    "ap_account_id" BIGINT NOT NULL,
    CONSTRAINT "Bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bills_ap_account_id_fkey" FOREIGN KEY ("ap_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillLineItems" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "external_id" TEXT NOT NULL,
    "line_type" TEXT NOT NULL DEFAULT 'expense',
    "description" TEXT,
    "amount" DECIMAL NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "tax_amount" DECIMAL,
    "bill_id" BIGINT NOT NULL,
    "ledger_account_id" BIGINT NOT NULL,
    CONSTRAINT "BillLineItems_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BillLineItems_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "external_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "payment_date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "check_number" TEXT,
    "memo" TEXT,
    "bill_id" BIGINT NOT NULL,
    "ledger_account_id" BIGINT NOT NULL,
    CONSTRAINT "Payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payments_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "LedgerAccounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccounts_external_id_key" ON "LedgerAccounts"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vendors_external_id_key" ON "Vendors"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bills_external_id_key" ON "Bills"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "BillLineItems_external_id_key" ON "BillLineItems"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_external_id_key" ON "Payments"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_external_id_bill_id_key" ON "Payments"("external_id", "bill_id");
