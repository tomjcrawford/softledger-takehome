import "dotenv/config";
import { prisma } from "./db.js";
import { ingestService } from "./services/ingestService.js";

async function main() {
  await prisma.$connect();
  console.log("Connected to SQLite via Prisma");

  const ingest = new ingestService();
  await ingest.run();
  console.log("Ingestion complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
