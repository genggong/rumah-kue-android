import * as SQLite from 'expo-sqlite/legacy';

// === Database mandiri (offline) — skema meniru rumahkue.db ===
let db = null;

export async function initDb() {
  db = await SQLite.openDatabaseAsync('rumahkue.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','produksi','pemesan')),
      nama TEXT NOT NULL,
      hp TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS bahan_baku (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL UNIQUE,
      satuan TEXT NOT NULL DEFAULT 'pcs',
      stok REAL NOT NULL DEFAULT 0,
      harga_satuan REAL NOT NULL DEFAULT 0,
      min_stok REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS produk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      kategori TEXT NOT NULL CHECK (kategori IN ('KUE','NASI')),
      harga_jual REAL NOT NULL DEFAULT 0,
      aktif INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS produk_bahan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produk_id INTEGER NOT NULL,
      bahan_id INTEGER NOT NULL,
      qty REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS pesanan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_pesanan TEXT NOT NULL UNIQUE,
      pemesan_id INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      jam TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'baru'
        CHECK (status IN ('baru','verifikasi','produksi','selesai','batal')),
      catatan TEXT DEFAULT '',
      total REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS pesanan_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pesanan_id INTEGER NOT NULL,
      produk_id INTEGER NOT NULL,
      qty REAL NOT NULL DEFAULT 1,
      harga REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pesanan_id INTEGER NOT NULL,
      tahap TEXT NOT NULL,
      catatan TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS stok_mutasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bahan_id INTEGER NOT NULL,
      pesanan_id INTEGER,
      jenis TEXT NOT NULL CHECK (jenis IN ('masuk','keluar','koreksi')),
      jumlah REAL NOT NULL DEFAULT 0,
      catatan TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_pesanan_status ON pesanan(status);
    CREATE INDEX IF NOT EXISTS idx_pesanan_tanggal ON pesanan(tanggal);
  `);

  // Seed akun default (sama dgn web)
  const c = await db.getFirstAsync('SELECT COUNT(*) c FROM users');
  if (c.c === 0) {
    await db.runAsync(
      "INSERT INTO users (username, password, role, nama) VALUES (?,?,?,?)",
      ['admin', 'admin123', 'admin', 'Admin']
    );
    await db.runAsync(
      "INSERT INTO users (username, password, role, nama) VALUES (?,?,?,?)",
      ['produksi', 'produksi123', 'produksi', 'Produksi']
    );
    await db.runAsync(
      "INSERT INTO users (username, password, role, nama) VALUES (?,?,?,?)",
      ['pemesan', 'pemesan123', 'pemesan', 'Pemesan']
    );
  }

  // Seed data demo (produk & bahan) bila kosong — biar app langsung terisi
  const pc = await db.getFirstAsync('SELECT COUNT(*) c FROM produk');
  if (pc.c === 0) {
    const bahan = [
      ['Tepung terigu', 'kg', 20, 12000, 5],
      ['Gula pasir', 'kg', 15, 14000, 5],
      ['Telur', 'butir', 60, 2500, 20],
      ['Mentega', 'kg', 8, 30000, 3],
      ['Coklat batang', 'pcs', 12, 15000, 5],
      ['Nasi', 'porsi', 40, 5000, 15],
      ['Ayam goreng', 'pcs', 40, 8000, 15],
      ['Kerupuk', 'pcs', 60, 1000, 20],
    ];
    for (const [n, s, st, h, m] of bahan) {
      await db.runAsync(
        'INSERT INTO bahan_baku (nama, satuan, stok, harga_satuan, min_stok) VALUES (?,?,?,?,?)',
        [n, s, st, h, m]
      );
    }
    const produk = [
      ['Black Forest', 'KUE', 250000],
      ['Red Velvet', 'KUE', 230000],
      ['Cheese Cake', 'KUE', 210000],
      ['Paket Nasi Ayam', 'NASI', 25000],
      ['Paket Nasi Rendang', 'NASI', 30000],
      ['Tumpeng Mini', 'NASI', 150000],
    ];
    for (const [n, k, h] of produk) {
      await db.runAsync(
        'INSERT INTO produk (nama, kategori, harga_jual, aktif) VALUES (?,?,?,1)',
        [n, k, h]
      );
    }
    // Resep sederhana: Black Forest, Red Velvet, Cheese Cake pakai bahan kue;
    // paket nasi pakai nasi + ayam + kerupuk
    const resep = [
      [1, 1, 0.5], [1, 2, 0.4], [1, 3, 4], [1, 4, 0.2], [1, 5, 2],
      [2, 1, 0.5], [2, 2, 0.4], [2, 3, 4], [2, 4, 0.2], [2, 5, 2],
      [3, 1, 0.4], [3, 2, 0.3], [3, 3, 3], [3, 4, 0.3],
      [4, 6, 1], [4, 7, 1], [4, 8, 1],
      [5, 6, 1], [5, 7, 1], [5, 8, 1],
      [6, 6, 4], [6, 7, 4], [6, 8, 4],
    ];
    for (const [pid, bid, qty] of resep) {
      await db.runAsync(
        'INSERT INTO produk_bahan (produk_id, bahan_id, qty) VALUES (?,?,?)',
        [pid, bid, qty]
      );
    }
  }
}

export const getDb = () => {
  if (!db) throw new Error('Database belum di-init. Tunggu splash screen selesai.');
  return db;
};

// === Helper query umum ===
export async function login(username, password) {
  const u = await db.getFirstAsync(
    'SELECT * FROM users WHERE username = ? AND aktif = 1', [username]
  );
  // versi sederhana (tanpa bcrypt di app; password plain utk lokal)
  if (!u || u.password !== password) return null;
  return u;
}