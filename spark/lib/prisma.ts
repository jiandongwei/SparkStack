import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createClient() {
  // Prefer a pooled URL for runtime (Neon pooler). Apps commonly set two
  // env vars: `DATABASE_URL` (direct URL used for migrations) and
  // `DATABASE_URL_POOL` (pooled URL used at runtime). Use the pool URL when
  // present; otherwise fall back to `DATABASE_URL`.
  // Normalize env values: some dotenv formats include surrounding quotes which
  // would break `includes` checks and Prisma URL parsing. Trim and strip
  // surrounding single/double quotes if present.
  const rawPool = process.env.DATABASE_URL_POOL ?? process.env.DATABASE_URL ?? "";
  const poolUrl = rawPool.trim().replace(/^['"]|['"]$/g, "");
  // Diagnostic: log which DB env is present (do not print the full URL)
  try {
    const present = !!poolUrl;
    const looksLikeNeon = present && poolUrl.includes("neon.tech");
    const dbSummary = (u: string) => {
      if (!u) return "<missing>";
      try {
        const m = u.match(/@([^:/?]+)/);
        return m ? m[1] : "<redacted>";
      } catch {
        return "<redacted>";
      }
    };
    console.log("[prisma] poolUrl present:", present, "looksLikeNeon:", looksLikeNeon, "dbHost:", dbSummary(poolUrl));
  } catch (e) {
    console.error("[prisma] diagnostic error", e);
  }

  // If the URL looks like Neon, attempt to wire the Neon adapter using the
  // serverless pool. This avoids depending on `pg` and matches Prisma 7+
  // requirements for serverless Postgres providers.
  if (poolUrl && poolUrl.includes("neon.tech")) {
    try {
      // Require at runtime so projects without these packages won't fail until
      // they actually attempt to connect to Neon.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaNeon } = require("@prisma/adapter-neon");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require("@neondatabase/serverless");

        const pool = new Pool({ connectionString: poolUrl });
        console.log("[prisma] creating PrismaNeon adapter, PrismaNeon type:", typeof PrismaNeon, "Pool type:", typeof Pool);
        const adapterInstance = new PrismaNeon(pool);
        console.log("[prisma] adapter instance created, adapterType:", typeof adapterInstance);
        const client = new PrismaClient({ adapter: adapterInstance });
      if (process.env.NODE_ENV !== "production") (global as any).prisma = client;
      return client;
    } catch (err: any) {
      console.error(
        "Missing Neon adapter dependencies. Install @prisma/adapter-neon and @neondatabase/serverless and set DATABASE_URL_POOL to your Neon pooled URL.",
        err?.message ?? err
      );
      throw err;
    }
  }

  // Otherwise create a normal PrismaClient which will read the datasource
  // from `prisma.config.ts` or `DATABASE_URL` at runtime. If neither is set,
  // Prisma will raise a clear error — surface that here with a helpful hint.
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "No DATABASE_URL set. Set DATABASE_URL (direct Neon URL for migrations) or DATABASE_URL_POOL (pooled runtime URL) in your environment."
    );
  }

  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") (global as any).prisma = client;
  return client;
}

// Always create a fresh client on module load to avoid stale/invalid global
// instances during Next.js hot reloads. Store to global only in development
// to prevent too many clients in production serverless environments.
const prisma = createClient();
if (process.env.NODE_ENV !== "production") (global as any).prisma = prisma;

console.debug("[prisma] client created, NODE_ENV=", process.env.NODE_ENV);

export default prisma;
