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
        binary_b64 TEXT,
        skeleton_b64 TEXT,
        overlay_b64 TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure table columns exist if upgrading existing schema
    try {
      db.run(`ALTER TABLE analysis_records ADD COLUMN binary_b64 TEXT`);
    } catch (e) {}
    try {
      db.run(`ALTER TABLE analysis_records ADD COLUMN skeleton_b64 TEXT`);
    } catch (e) {}
    try {
      db.run(`ALTER TABLE analysis_records ADD COLUMN overlay_b64 TEXT`);
    } catch (e) {}

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
 * Downloads the active SQLite database binary file as a .sqlite download
 */
export async function exportDatabaseFile() {
  if (!db) await initDb();
  if (!db) return;

  const binaryArray = db.export();
  const blob = new Blob([binaryArray], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `plga_vascular_db_${Date.now()}.sqlite`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  if (!db) await initDb();

  const researcherEmail = record.researcherEmail || record.user_email || record.email || 'sanjay@biomed.org';
  const researcherName = record.researcherName || record.user_name || 'Sanjay Grs';
  const institution = record.institution || 'Biomedical Institute';
  const role = record.role || 'Researcher';

  const vesselDensity = record.vesselDensity ?? record.vessel_density ?? 0;
  const branchPoints = record.branchPoints ?? record.branch_points ?? 0;
  const vesselSegments = record.vesselSegments ?? record.vessel_segments ?? 0;
  const totalLength = record.totalLength ?? record.total_length ?? 0;
  const avgWidth = record.avgWidth ?? record.avg_width ?? 0;
  const endpoints = record.endpoints ?? 0;
  const lacunarity = record.lacunarity ?? 0;
  const connectivity = record.connectivity ?? 0;

  const binaryB64 = record.binaryB64 || record.binary_b64 || null;
  const skeletonB64 = record.skeletonB64 || record.skeleton_b64 || null;
  const overlayB64 = record.overlayB64 || record.overlay_b64 || null;
  const createdAt = record.createdAt || record.created_at || new Date().toISOString();

  await run(
    `INSERT INTO analysis_records (
      researcher_email, researcher_name, institution, role,
      vessel_density, branch_points, vessel_segments, total_length,
      avg_width, endpoints, lacunarity, connectivity,
      binary_b64, skeleton_b64, overlay_b64, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      researcherEmail,
      researcherName,
      institution,
      role,
      vesselDensity,
      branchPoints,
      vesselSegments,
      totalLength,
      avgWidth,
      endpoints,
      lacunarity,
      connectivity,
      binaryB64,
      skeletonB64,
      overlayB64,
      createdAt
    ]
  );

  const rowIdResult = query(`SELECT last_insert_rowid() as id`);
  const lastId = rowIdResult[0]?.id || 1;
  return lastId;
}

export async function getAnalysisRecords(email = null) {
  if (!db) await initDb();
  if (email) {
    return query(`SELECT * FROM analysis_records WHERE researcher_email = ? ORDER BY id DESC`, [email]);
  }
  return query(`SELECT * FROM analysis_records ORDER BY id DESC`);
}

export async function deleteAnalysisRecord(id) {
  if (!db) await initDb();
  await run(`DELETE FROM analysis_records WHERE id = ?`, [id]);
}
