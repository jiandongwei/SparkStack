const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function getDatabaseUrl() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return process.env.DATABASE_URL;
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/^DATABASE_URL=(?:['"]?)(.*?)(?:['"]?)$/m);
  if (m) return m[1];
  return process.env.DATABASE_URL;
}

async function run() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', '20260226_init', 'migration.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const pool = new Pool({ connectionString: dbUrl });
  try {
    console.log('Connecting to DB...');
    const client = await pool.connect();
    try {
      console.log('Running migration...');
      await client.query(sql);
      console.log('Migration applied successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
