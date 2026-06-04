import type { LedgerBalance, LedgerType } from "../../generated/prisma/enums.js";

export interface LedgerAccount {
  id: string;
  external_id: string;
  name: string;
  number: string;
  type: LedgerType;
  subtype: string;
  natural_balance: LedgerBalance;
  description?: string;
  inactive: boolean;
}
export type CreateLedgerAccount = Omit<LedgerAccount, 'id'>;

export interface Vendor {
  id: string;
  external_id: string;
  expense_account_id?: string;
  name: string;
  email?: string;
  ein?: string;
  is_1099: boolean;
  inactive: boolean;
  address_line_1?: string;
  address_line_2?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}
export type CreateVendor = Omit<Vendor, 'id'>;

export interface Bill {
  id: string;
  external_id: string;
  vendor_id: string;
  ap_account_id: string;
  invoice_date: string;
  posting_date: string;
  due_date?: string;
  description?: string;
  currency: string;
  inactive: boolean;
}
export type CreateBill = Omit<Bill, 'id'>;

export interface BillLineItem {
  id: string;
  external_id: string;
  bill_id: string;
  ledger_account_id: string;
  line_type: string;
  description?: string;
  amount: number;
  quantity: number;
  tax_amount?: number;
}
export type CreateBillLineItem = Omit<BillLineItem, 'id'>;

export interface Payment {
  id: string;
  external_id: string;
  bill_id: string;
  ledger_account_id: string;
  type: string;
  payment_date: string;
  amount: number;
  check_number?: string;
  memo?: string;
}
export type CreatePayment = Omit<Payment, 'id'>;
