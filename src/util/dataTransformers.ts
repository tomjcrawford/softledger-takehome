import type { LedgerBalance, LedgerType } from "../../generated/prisma/enums.js";
import { AbacusBill, AbacusBillLineItem, AbacusBillPayments, AbacusLedgerAccount, AbacusLedgerType, AbacusVendor } from "../types/abacusTypes";
import { CreateBill, CreateBillLineItem, CreateLedgerAccount, CreatePayment, CreateVendor } from "../types/internalTypes";

export function transformLedger(abacusLedger: AbacusLedgerAccount): CreateLedgerAccount {
    const typeAndBalance = mapAccountTypeAndBalance(abacusLedger.accountType);

    return {
        external_id: abacusLedger.id,
        name: abacusLedger.name,
        number: abacusLedger.accountNumber,
        type: typeAndBalance.type,
        subtype: abacusLedger.accountType,
        natural_balance: typeAndBalance.naturalBalance,
        description: abacusLedger.description ?? '',
        inactive: !abacusLedger.isActive,
    };
}

const mapAccountTypeAndBalance = (
    abacusType: AbacusLedgerType,
): { type: LedgerType; naturalBalance: LedgerBalance } => {
    switch (abacusType) {
        case 'BANK':
            return { type: 'Asset', naturalBalance: 'Debit' };
        case 'ACCOUNTS_PAYABLE':
            return { type: 'Liability', naturalBalance: 'Credit' };
        case 'ACCOUNTS_RECEIVABLE':
            return { type: 'Asset', naturalBalance: 'Debit' };
        case 'OTHER_CURRENT_LIABILITY':
            return { type: 'Liability', naturalBalance: 'Credit' };
        case 'EQUITY':
            return { type: 'Equity', naturalBalance: 'Credit' };
        case 'INCOME':
            return { type: 'Revenue', naturalBalance: 'Credit' };
        case 'EXPENSE':
            return { type: 'Expense', naturalBalance: 'Debit' };
        case 'COST_OF_GOODS_SOLD':
            return { type: 'Expense', naturalBalance: 'Debit' };
        default:
            return { type: 'Expense', naturalBalance: 'Debit' };
    };
};

export function transformVendor(abacusVendor: AbacusVendor): CreateVendor {
    return {
        external_id: abacusVendor.id,
        expense_account_id: abacusVendor.defaultExpenseAccountId,
        name: abacusVendor.name,
        email: abacusVendor.email ?? '',
        ein: '', // no EIN provided from Abacus
        is_1099: abacusVendor.is1099,
        inactive: !abacusVendor.isActive,
        address_line_1: abacusVendor.address?.line1 ?? '',
        address_line_2: abacusVendor.address?.line2 ?? '',
        address_city: abacusVendor.address?.city ?? '',
        address_state: abacusVendor.address?.stateOrProvince ?? '',
        address_zip: abacusVendor.address?.zipOrPostalCode ?? '',
        address_country: abacusVendor.address?.country ?? '',
        contact_name: abacusVendor.contactName ?? '',
        contact_phone: abacusVendor.contactPhone ?? '',
        contact_email: abacusVendor.email ?? '',
    };
}

export function transformBill(abacusBill: AbacusBill): CreateBill {
    return {
        external_id: abacusBill.id,
        vendor_id: abacusBill.vendorId,
        ap_account_id: abacusBill.invoice.payFromChartOfAccountId,
        invoice_date: new Date(abacusBill.invoice.invoiceDate).toISOString(),
        posting_date: new Date(abacusBill.invoice.glPostingDate).toISOString(),
        due_date: abacusBill.dueDate ? new Date(abacusBill.dueDate).toISOString() : undefined,
        description: abacusBill.description ?? '',
        currency: abacusBill.billCurrency,
        inactive: abacusBill.archived,
    };
}

export function transformBillLineItem(abacusBillLineItem: AbacusBillLineItem): CreateBillLineItem {
    const abacusAmount = parseFloat(abacusBillLineItem.amount);
    const abacusQuantity = parseFloat(abacusBillLineItem.quantity);
    const abacusTaxAmount = parseFloat(abacusBillLineItem.taxAmount ?? 0);

    return {
        external_id: abacusBillLineItem.id,
        bill_id: abacusBillLineItem.billId,
        ledger_account_id: abacusBillLineItem.classifications.chartOfAccountId,
        line_type: 'expense', // no line type info provided from Abacus
        description: abacusBillLineItem.description ?? '',
        amount: (isNaN(abacusAmount) ? 0.00 : abacusAmount),
        quantity: (isNaN(abacusQuantity) ? 0.00 : abacusQuantity),
        tax_amount: (isNaN(abacusTaxAmount) ? 0.00 : abacusTaxAmount),
    };
}

export function transformPayment(abacusPayment: AbacusBillPayments): CreatePayment[] {

    return abacusPayment.billPayments.map(billPayment => {
        const abacusAmount = parseFloat(billPayment.amount);
        return {
            external_id: billPayment.id,
            bill_id: billPayment.billId,
            ledger_account_id: abacusPayment.fundingAccount.id,
            type: 'manual', // no payment type info provided from Abacus
            payment_date: new Date(abacusPayment.paymentDate).toISOString(),
            amount: (isNaN(abacusAmount) ? 0.00 : abacusAmount),
            check_number: abacusPayment.disbursement.checkNumber ?? '',
            memo: abacusPayment.memo ?? '',
        };
    });
}
