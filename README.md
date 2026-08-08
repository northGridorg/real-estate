# northGrid Systems — Private CRM Suite & Portfolio Vault

Web CRM for Dubai brokers and wealth advisors. **DLD Sales (secondary)** + **DLD Oqood (off-plan registration & resale)** only. **No Ejari / rental** datasets.

## Stack

- Next.js App Router · React 19 · TypeScript
- PostgreSQL + Prisma · RLS (`advisor_id` ↔ `auth.uid()`)
- Integer **cents** (AED × 100) + **BPS** (`100% = 10_000`)
- Mapbox GL (growth map) · Tailwind

## Routes

| Route | Module |
|-------|--------|
| `/crm` | Clients, preferences, entities, app tokens |
| `/communities` | Secondary vs off-plan gap, absorption, appreciation |
| `/assets` | `OFF_PLAN` / `SECONDARY` ledger + payment steps |
| `/yield-map` | Capital gains / off-plan volume / AED/sq.ft heatmaps |
| `/prospectus` | Decks, payment schedules, exit ROI |
| `/reports` | Deployed capital, unrealized gains, SPV audit |
| `/settings` | DLD sync, `me-central-1`, RLS |

## Quick start

```bash
cp .env.example .env.local
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000/crm

## DLD ingest (Sales + Oqood only)

```bash
npm run ingest:dld -- /path/to/dld-transactions.csv
# or
npx tsx scripts/ingest-dld-sales.ts ./feed.ndjson --format=ndjson
```

Keeps: `Sales`, `Off-Plan Registration`, `Off-Plan Resale`.  
Drops: Ejari, rent, lease, mortgage. Batches of **1,000**.

## Integer math

```ts
import { percentToBps, aedToCents, allocateByBps, unrealizedGainCents } from "@/lib/math";

percentToBps(33.33);           // 3333
aedToCents(500_000);           // 50_000_000
allocateByBps(100_000_000, [3333, 3333, 3334]);
```

## Layout

```
app/(dashboard)/          # 7 module routes
lib/math/basis-points.ts  # BPS + cents engine
lib/types/domain.ts       # Module DTOs
scripts/ingest-dld-sales.ts
prisma/schema.prisma
prisma/rls-policies.sql
```
