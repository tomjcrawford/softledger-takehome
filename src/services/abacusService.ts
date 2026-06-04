import { AbacusBill, AbacusBillPayments, AbacusLedgerAccount, AbacusListResponse, AbacusVendor } from "../types/abacusTypes";

const ABACUS_URL = process.env.ABACUS_API_URL;
const AUTH_HEADERS = {
    Authorization: `Bearer ${process.env.ABACUS_API_KEY}`,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AbacusService {
    async getLedgers(page?: string): Promise<AbacusListResponse<AbacusLedgerAccount>> {
        let url = `${ABACUS_URL}/v1/ledger-accounts?max=20`;
        if (page) {
            url = `${url}&page=${page}`;
        }

        return this.fetchJson<AbacusListResponse<AbacusLedgerAccount>>(url, "ledger-accounts");
    }

    async getVendors(page?: string): Promise<AbacusListResponse<AbacusVendor>> {
        let url = `${ABACUS_URL}/v1/vendors?max=20`;
        if (page) {
            url = `${url}&page=${page}`;
        }

        return this.fetchJson<AbacusListResponse<AbacusVendor>>(url, "vendors");
    }

    async getBills(page?: string): Promise<AbacusListResponse<AbacusBill>> {
        let url = `${ABACUS_URL}/v1/bills?max=20`;
        if (page) {
            url = `${url}&page=${page}`;
        }

        return this.fetchJson<AbacusListResponse<AbacusBill>>(url, "bills");
    }

    async getBillPayments(page?: string): Promise<AbacusListResponse<AbacusBillPayments>> {
        let url = `${ABACUS_URL}/v1/bill-payments?max=20`;
        if (page) {
            url = `${url}&page=${page}`;
        }

        return this.fetchJson<AbacusListResponse<AbacusBillPayments>>(url, "bill-payments");
    }

    async healthCheck(): Promise<number> {
        const response = await fetch(`${ABACUS_URL}/health`, { headers: AUTH_HEADERS });
        return response.status;
    }

    async waitUntilHealthy(maxAttempts = 30, initialDelayMs = 1000): Promise<void> {
        let delayMs = initialDelayMs;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const status = await this.healthCheck();
            if (status === 200) {
                return;
            }

            if (attempt === maxAttempts) {
                throw new Error(
                    `Abacus health check failed after ${maxAttempts} attempts (last status: ${status})`,
                );
            }

            console.warn(
                `Abacus health check returned ${status}, retrying in ${delayMs}ms (attempt ${attempt}/${maxAttempts})`,
            );
            await sleep(delayMs);
            delayMs = Math.min(delayMs * 2, 30_000);
        }
    }

    private async fetchJson<T>(url: string, context: string): Promise<T> {
        const response = await fetch(url, { headers: AUTH_HEADERS });

        if (!response.ok) {
            const body = await response.text();
            const detail = body ? ` - ${body.slice(0, 200)}` : "";
            throw new Error(
                `Abacus ${context} request failed: ${response.status} ${response.statusText}${detail}`,
            );
        }

        return response.json() as Promise<T>;
    }
}
