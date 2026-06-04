import { prisma } from "../db";
import { CreateBill, CreateBillLineItem, CreateLedgerAccount, CreatePayment, CreateVendor } from "../types/internalTypes";

export class DbService {
    async saveLedger(ledger: CreateLedgerAccount) {
        const { external_id, ...data } = ledger;

        return prisma.ledgerAccounts.upsert({
            where: { external_id: ledger.external_id },
            update: data,
            create: ledger,
        });
    }

    async saveVendor(vendor: CreateVendor) {
        const { external_id, expense_account_id, ...scalar } = vendor;

        let expenseAccountConnect;
        if (expense_account_id) {
            const ledger = await prisma.ledgerAccounts.findUnique({
                where: { external_id: expense_account_id },
                select: { id: true },
            });

            if (!ledger) {
                throw new Error(`Expense account with id ${expense_account_id} not found`);
            }

            expenseAccountConnect = { connect: { id: ledger.id } };
        }

        const data = {
            ...scalar,
            ...(expenseAccountConnect ? { expense_account: expenseAccountConnect } : {}),
        };

        return prisma.vendors.upsert({
            where: { external_id: vendor.external_id },
            update: data,
            create: { external_id, ...data },
        });
    }

    async saveBill(bill: CreateBill) {
        const { external_id, vendor_id, ap_account_id, due_date, ...scalar } = bill;

        const vendor = await prisma.vendors.findUnique({
            where: { external_id: vendor_id },
            select: { id: true },
        });
        if (!vendor) {
            console.warn({
              message: "Skipping bill due to missing vendor",
              bill_external_id: bill.external_id,
              missing_vendor_external_id: vendor_id,
            });
          
            return false; // skip this bill, bad data
          }

        const apAccount = await prisma.ledgerAccounts.findUnique({
            where: { external_id: ap_account_id },
            select: { id: true },
        });
        if (!apAccount) {
            throw new Error(`AP account with id ${ap_account_id} not found`);
        }

        const data = {
            ...scalar,
            due_date: due_date || null,
            vendor: { connect: { id: vendor.id } },
            ap_account: { connect: { id: apAccount.id } },
        };

        return prisma.bills.upsert({
            where: { external_id },
            update: data,
            create: { external_id, ...data },
        });
    }

    async saveBillLineItem(billLineItem: CreateBillLineItem) {
        const { external_id, bill_id, ledger_account_id, description, tax_amount, ...scalar } =
            billLineItem;

        const bill = await prisma.bills.findUnique({
            where: { external_id: bill_id },
            select: { id: true },
        });
        if (!bill) {
            throw new Error(`Bill with id ${bill_id} not found`);
        }

        const ledgerAccount = await prisma.ledgerAccounts.findUnique({
            where: { external_id: ledger_account_id },
            select: { id: true },
        });
        if (!ledgerAccount) {
            throw new Error(`Ledger account with id ${ledger_account_id} not found`);
        }

        const data = {
            ...scalar,
            description: description || null,
            tax_amount: tax_amount ?? null,
            bill: { connect: { id: bill.id } },
            ledger_account: { connect: { id: ledgerAccount.id } },
        };

        return prisma.billLineItems.upsert({
            where: { external_id },
            update: data,
            create: { external_id, ...data },
        });
    }

    async savePayment(payment: CreatePayment) {
        const { external_id, bill_id, ledger_account_id, check_number, memo, ...scalar } = payment;

        const bill = await prisma.bills.findUnique({
            where: { external_id: bill_id },
            select: { id: true },
        });
        if (!bill) {
            throw new Error(`Bill with id ${bill_id} not found`);
        }

        const ledgerAccount = await prisma.ledgerAccounts.findUnique({
            where: { external_id: ledger_account_id },
            select: { id: true },
        });
        if (!ledgerAccount) {
            throw new Error(`Ledger account with id ${ledger_account_id} not found`);
        }

        const data = {
            ...scalar,
            check_number: check_number || null,
            memo: memo || null,
            bill: { connect: { id: bill.id } },
            ledger_account: { connect: { id: ledgerAccount.id } },
        };

        return prisma.payments.upsert({
            where: { external_id },
            update: data,
            create: { external_id, ...data },
        });
    }
}