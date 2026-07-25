import initSqlJs from 'sql.js';
import localforage from 'localforage';

let SQL = null;
let db = null;

const DB_KEY = 'plga_sqlite_db';

/**
 * Step 3: Initialize SQLite DB using sql.js + localforage (IndexedDB persistence)
 */
export async function initDb() {
  if (db) return db;

  try {
    SQL = await initSqlJs({ locateFile: () => '/sqljs/sql-wasm.wasm' });

    const saved = await localforage.getItem(DB_KEY); // Uint8Array or null
    db = saved ? new SQL.Database(new Uint8Array(saved)) : new SQL.Database();

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        institution TEXT,
        role TEXT,
        password_hash TEXT
      );
      CREATE TABLE IF NOT EXISTS analysis_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        researcher_email TEXT NOT NULL,
        researcher_name TEXT,
        institution TEXT,
        role TEXT,
        vessel_density REAL,
        branch_points INTEGER,
        vessel_segments INTEGER,
        total_length INTEGER,
        avg_width REAL,
        endpoints INTEGER,
        lacunarity REAL,
        connectivity REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default demo user if empty
    try {
      const userCheck = query("SELECT COUNT(*) as count FROM users");
      if (!userCheck || userCheck[0]?.count === 0) {
        db.run(
          `INSERT INTO users (email, first_name, last_name, institution, role, password_hash)
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['sanjay@biomed.org', 'Sanjay', 'Grs', 'Biomedical Institute', 'Researcher', 'demo123']
        );
      }
    } catch (e) {
      console.warn('Default user setup warning:', e);
    }

    await persist(); // save schema immediately on first run
    console.log('SQLite database initialized & persisted to IndexedDB via localforage');
    return db;
  } catch (err) {
    console.error('Failed to initialize sql.js with localforage:', err);
    return null;
  }
}

// Alias for backwards compatibility
export const initDB = initDb;

export async function persist() {
  if (!db) return;
  try {
    const binaryArray = db.export(); // Uint8Array snapshot of the whole DB
    await localforage.setItem(DB_KEY, binaryArray);
  } catch (err) {
    console.error('Failed saving SQLite binary via localforage:', err);
  }
}

// Generic insert/update — call persist() after every write
export async function run(sql, params = []) {
  if (!db) await initDb();
  if (!db) return;
  db.run(sql, params);
  await persist();
}

// Generic select — returns array of row objects
export function query(sql, params = []) {
  if (!db) return [];
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch (err) {
    console.error('SQLite query error:', err);
    return [];
  }
}

export function getDb() {
  return db;
}

/**
 * High-Level Helper Exports for Auth & Analysis
 */
export async function saveUser({ email, firstName, lastName, institution, role, password }) {
  await run(
    `INSERT OR REPLACE INTO users (email, first_name, last_name, institution, role, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, firstName, lastName, institution, role, password || 'defaultPass']
  );
}

export async function getUserByEmail(email) {
  if (!db) await initDb();
  const rows = query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows.length > 0 ? rows[0] : null;
}

export async function saveAnalysisRecord(record) {
  await run(
    `INSERT INTO analysis_records (
      researcher_email, researcher_name, institution, role,
      vessel_density, branch_points, vessel_segments, total_length,
      avg_width, endpoints, lacunarity, connectivity, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.researcherEmail || 'sanjay@biomed.org',
      record.researcherName || 'Sanjay Grs',
      record.institution || 'Biomedical Institute',
      record.role || 'Researcher',
      record.vesselDensity,
      record.branchPoints,
      record.vesselSegments,
      record.totalLength,
      record.avgWidth,
      record.endpoints,
      record.lacunarity,
      record.connectivity,
      record.createdAt || new Date().toISOString()
    ]
  );
}

export async function getAnalysisRecords(email = null) {
  if (!db) await initDb();
  if (email) {
    return query(`SELECT * FROM analysis_records WHERE researcher_email = ? ORDER BY id DESC`, [email]);
  }
  return query(`SELECT * FROM analysis_records ORDER BY id DESC`);
}
