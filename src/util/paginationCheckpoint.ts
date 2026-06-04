import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export type PaginationResource = "ledgers" | "vendors" | "bills" | "bill-payments";

const CHECKPOINT_DIR = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../data",
);

const CHECKPOINT_FILES: Record<PaginationResource, string> = {
    ledgers: "ledger-pagination.json",
    vendors: "vendor-pagination.json",
    bills: "bills-pagination.json",
    "bill-payments": "bill-payments-pagination.json",
};

export interface PaginationCheckpoint {
    nextPage: string | null;
}

function checkpointPath(resource: PaginationResource): string {
    return path.join(CHECKPOINT_DIR, CHECKPOINT_FILES[resource]);
}

export async function loadPaginationCheckpoint(
    resource: PaginationResource,
): Promise<string | undefined> {
    try {
        const raw = await readFile(checkpointPath(resource), "utf-8");
        const checkpoint = JSON.parse(raw) as PaginationCheckpoint;
        return checkpoint.nextPage || undefined;
    } catch {
        return undefined;
    }
}

export async function savePaginationCheckpoint(
    resource: PaginationResource,
    nextPage: string | null | undefined,
): Promise<void> {
    await mkdir(CHECKPOINT_DIR, { recursive: true });
    const checkpoint: PaginationCheckpoint = { nextPage: nextPage ?? null };
    await writeFile(
        checkpointPath(resource),
        JSON.stringify(checkpoint, null, 2),
        "utf-8",
    );
}
