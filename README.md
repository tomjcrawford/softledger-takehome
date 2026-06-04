# SoftLedger Take-home

## How to run

1. Install dependencies: `npm install`
2. Copy environment variables: create `.env` from `.env.example`
3. Apply schema changes: `npm run db:migrate`
4. Generate the client: `npm run db:generate`
5. Run the data sync: `npm start`
6. View the database: `npx prisma studio`

**Requires Node.js 20.19+** (Prisma 7).


## Assumptions
1. The `billPayments` attribute from Abacus would always have at least one record.
2. We don't want the ingestion pipeline to make the decision on how to handle potentially bad data.
3. We would rather have the full name for Vendors rather than the shortName, so dropped the shortName since it didn't match the internal schema.
4. Abacus Vendors don't have a contactEmail separate from the Vendor's email, save the Vendor email in the contact_email column as well in case we use that elsewhere.
5. Since no info was provided by Abacus for Line Type or Payment Type, enforce the default when mapping.
6. The fetch routes will continue to show "oldest records first" (sorting by id), so jump to the last page imported when runing subsequent times.

## Edge Cases
1. A bill with a vendorId from a legacy system where the associated vendor was unable to be imported. I skipped the bill and it's line items and output the billId to the console so that it could be delt with separately instead of breaking the ingestion altogether.
2. Save most recent page ingested for each type to cut down on API calls when running in the future
3. Used upsert so that re-running the ingestion from the top wouldn't cause issues with records that have already been imported.

## What I'd change
1. I would update retry logic for processing each type being imported.
2. I would move the mapping logic for Foreign Keys so that it doesn't have to make db calls to get the correct mapping.
3. I would add unit tests.
4. I would set up a schedule to run the ingestion daily.

## AI Usage

I used ChatGPT to help me with brainstorming and architecture. I used Cursor's built in agent to set up the initial project, help with errors encountered with Prisma, repetitive tasks (i.e. updates around saving the `nextPage` attribute for each type of data being ingested), and check over the code for potential bugs.