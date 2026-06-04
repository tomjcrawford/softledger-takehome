import { AbacusBill, AbacusBillPayments, AbacusLedgerAccount, AbacusVendor } from "../types/abacusTypes";
import { transformBill, transformBillLineItem, transformLedger, transformPayment, transformVendor } from "../util/dataTransformers";
import { loadPaginationCheckpoint, savePaginationCheckpoint } from "../util/paginationCheckpoint";
import { AbacusService } from "./abacusService";
import { DbService } from "./dbService";

export class ingestService {
    abacusService = new AbacusService();
    dbService = new DbService();

    async run() {
        await this.abacusService.waitUntilHealthy();

        await this.processLedgers();
        await this.processVendors();
        await this.processBills();
        await this.processPayments();
    }

    async processLedgers() {
        const startingPage = await loadPaginationCheckpoint("ledgers");
        await this.fetchAllLedgers(startingPage);
    }

    async fetchAllLedgers(startingPage?: string): Promise<void> {
        let ledgersResponse = await this.abacusService.getLedgers(startingPage);
        await this.persistLedgerPage(ledgersResponse.results);

        while (ledgersResponse.nextPage) {
            await savePaginationCheckpoint("ledgers", ledgersResponse.nextPage);

            ledgersResponse = await this.abacusService.getLedgers(ledgersResponse.nextPage);

            await this.persistLedgerPage(ledgersResponse.results);
        }
    }

    private async persistLedgerPage(ledgers: AbacusLedgerAccount[]): Promise<void> {
        for (const ledger of ledgers) {
            await this.dbService.saveLedger(transformLedger(ledger));
        }
    }

    async processVendors() {
        const startingPage = await loadPaginationCheckpoint("vendors");
        await this.fetchAllVendors(startingPage);
    }

    async fetchAllVendors(startingPage?: string): Promise<void> {
        let vendorsResponse = await this.abacusService.getVendors(startingPage);
        await this.persistVendorPage(vendorsResponse.results);

        while (vendorsResponse.nextPage) {
            await savePaginationCheckpoint("vendors", vendorsResponse.nextPage);

            vendorsResponse = await this.abacusService.getVendors(vendorsResponse.nextPage);

            await this.persistVendorPage(vendorsResponse.results);
        }
    }

    private async persistVendorPage(vendors: AbacusVendor[]): Promise<void> {
        for (const vendor of vendors) {
            await this.dbService.saveVendor(transformVendor(vendor));
        }
    }

    async processBills() {
        const startingPage = await loadPaginationCheckpoint("bills");
        await this.fetchAllBills(startingPage);
    }

    async fetchAllBills(startingPage?: string): Promise<void> {
        let billsResponse = await this.abacusService.getBills(startingPage);
        await this.persistBillPage(billsResponse.results);

        while (billsResponse.nextPage) {
            await savePaginationCheckpoint("bills", billsResponse.nextPage);

            billsResponse = await this.abacusService.getBills(billsResponse.nextPage);

            await this.persistBillPage(billsResponse.results);
        }
    }

    private async persistBillPage(bills: AbacusBill[]): Promise<void> {
        for (const bill of bills) {
            const savedBill = await this.dbService.saveBill(transformBill(bill));
            if (!savedBill) {
                console.warn({
                    message: "Skipping bill due to bad data, skipping line items as well",
                    bill_external_id: bill.id,
                    vendor_external_id: bill.vendorId,
                    ap_account_external_id: bill.invoice.payFromChartOfAccountId,
                });
                continue; // skip this bill, bad data
            }

            for (const lineItem of bill.billLineItems ?? []) {
                await this.dbService.saveBillLineItem(transformBillLineItem(lineItem));
            }
        }
    }

    async processPayments() {
        const startingPage = await loadPaginationCheckpoint("bill-payments");
        await this.fetchAllBillPayments(startingPage);
    }

    async fetchAllBillPayments(startingPage?: string): Promise<void> {
        let billPaymentsResponse = await this.abacusService.getBillPayments(startingPage);
        await this.persistPaymentPage(billPaymentsResponse.results);

        while (billPaymentsResponse.nextPage) {
            await savePaginationCheckpoint("bill-payments", billPaymentsResponse.nextPage);

            billPaymentsResponse = await this.abacusService.getBillPayments(
                billPaymentsResponse.nextPage,
            );

            await this.persistPaymentPage(billPaymentsResponse.results);
        }
    }

    private async persistPaymentPage(payments: AbacusBillPayments[]): Promise<void> {
        for (const payment of payments) {
            for (const billPayment of transformPayment(payment)) {
                await this.dbService.savePayment(billPayment);
            }
        }
    }
}

