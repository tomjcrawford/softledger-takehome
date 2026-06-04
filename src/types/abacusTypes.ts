export interface AbacusLedgerAccount {
  id: string;
  entity: string;
  accountNumber: string;
  name: string;
  accountType: AbacusLedgerType;
  description: string;
  isActive: boolean;
  createdTime: string;
  updatedTime: string;
}

export type AbacusLedgerType = 'BANK' | 'ACCOUNTS_PAYABLE' | 'ACCOUNTS_RECEIVABLE' | 'OTHER_CURRENT_LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE' | 'COST_OF_GOODS_SOLD';

export interface AbacusVendor {
  id: string;
  entity: string;
  name: string;
  shortName: string;
  email: string;
  accountType: string;
  is1099: boolean;
  isActive: boolean;
  billCurrency: string;
  defaultExpenseAccountId: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    stateOrProvince: string;
    zipOrPostalCode: string;
    country: string;
    payeeName: string;
  };
  contactName: string;
  contactPhone: string;
  createdTime: string;
  updatedTime: string;
}

export interface AbacusBill {
  id: string;
  entity: string;
  vendorId: string;
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    glPostingDate: string;
    payFromChartOfAccountId: string;
  };
  dueDate: string;
  description: string;
  amount: string;
  amountDue: string;
  billCurrency: string;
  paymentStatus: string;
  archived: boolean;
  billLineItems: AbacusBillLineItem[];
  createdTime: string;
  updatedTime: string;
}

export interface AbacusBillLineItem {
  id: string;
  billId: string;
  lineNumber: number;
  description: string;
  quantity: string;
  price: string;
  amount: string;
  taxAmount: string;
  classifications: {
    chartOfAccountId: string;
    customerId: string;
  };
}

export interface AbacusBillPayments {
  id: string;
  entity: string;
  paymentDate: string;
  amount: string;
  paymentCurrency: string;
  fundingAccount: {
    type: string;
    id: string;
  };
  disbursement: {
    type: string;
    checkNumber: string;
  };
  memo: string;
  billPayments: {
    id: string;
    billId: string;
    amount: string;
  }[];
  isActive: boolean;
  createdTime: string;
  updatedTime: string;
}

export interface AbacusListResponse<T> {
    results: T[];
    nextPage: string;
}
