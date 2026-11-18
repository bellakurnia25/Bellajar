import { Pool } from 'pg';

// Satu pool dipakai ulang agar tidak membuka koneksi berlebih saat hot-reload.
const globalForPg = globalThis;

export const pool =
  globalForPg.__bellajarPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.__bellajarPool = pool;

/** Menjalankan Raw SQL berparameter ($1, $2, ...) dan mengembalikan semua baris. */
export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

/** Sama seperti query(), tetapi hanya baris pertama (atau null). */
export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}
