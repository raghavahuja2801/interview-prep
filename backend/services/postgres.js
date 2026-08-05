import { Pool } from 'pg'

function buildConnectionString() {
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const host = process.env.PGHOST || 'localhost'
  const port = process.env.PGPORT || '5432'
  const user = process.env.PGUSER || 'postgres'
  const password = process.env.PGPASSWORD || 'postgres'
  const database = process.env.PGDATABASE || 'interview_prep'

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

const pool = new Pool({
  connectionString: buildConnectionString(),
  ssl:
    process.env.POSTGRES_SSL === 'true' || process.env.PGSSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : undefined,
})

export async function ensureAuthSchema() {
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS auth_invites (
        code TEXT PRIMARY KEY,
        created_by TEXT,
        display_name TEXT,
        expires_at TIMESTAMPTZ,
        claimed_at TIMESTAMPTZ,
        claimed_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE auth_invites
      ADD COLUMN IF NOT EXISTS display_name TEXT;

      CREATE TABLE IF NOT EXISTS auth_sessions (
        session_token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);
      CREATE INDEX IF NOT EXISTS auth_invites_claimed_by_idx ON auth_invites(claimed_by);
    `)
  } finally {
    client.release()
  }
}

export { pool }