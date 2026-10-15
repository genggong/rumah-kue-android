# 🍰 Rumah Kue Android — Aplikasi Offline-First

Aplikasi Android **Rumah Kue** (manajemen pesanan kue & paket nasi) — **database mandiri di HP (SQLite), mode offline penuh**. Data tersimpan lokal di perangkat, jalan tanpa internet.

Teknologi: **React Native (Expo SDK 51) + expo-sqlite** • React Navigation

---

## ✨ Fitur

| Peran | Fitur |
|---|---|
| **Pemesan** | Lihat produk, buat pesanan offline (tanggal & jam pengambilan), riwayat & status |
| **Admin** | Kelola pesanan (verifikasi → produksi, kurangi stok otomatis), bahan baku & stok, laporan keuangan (omzet/HPP/laba), antrian produksi |
| **Produksi** | Antrian diurutkan tanggal & jam, tandai selesai |

- **Offline penuh**: semua data & transaksi tersimpan di SQLite lokal perangkat
- **Database mandiri**: skema `rumahkue.db` meniru versi web (users, bahan_baku, produk, produk_bahan, pesanan, pesanan_item, timeline, stok_mutasi)
- **Seed otomatis** saat pertama jalan: 3 akun demo + 8 bahan + 6 produk + resep

## 🔑 Akun Demo

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Produksi | `produksi` | `produksi123` |
| Pemesan | `pemesan` | `pemesan123` |

## 🚀 Menjalankan (Pengembangan)

```bash
npm install
npx expo start        # buka dgn Expo Go di HP (scan QR)
```

## 📦 Build APK

VPS tanpa Android SDK → pakai **EAS Build cloud**:

```bash
npm install -g eas-cli
eas login             # akun expo.dev (bisa login Google)
eas build -p android --profile preview
```

Atau buat akun EAS & project-id di `app.json` (`extra.eas.projectId`), lalu jalankan build. APK jadi di cloud → download & install.

## 📁 Struktur

```
rumah-kue-android/
├── App.js                    # Navigasi + init DB
├── db.js                     # SQLite offline + seed
├── screens/
│   ├── LoginScreen.js        # Auth 3 role
│   ├── HomeScreen.js         # Menu per role
│   ├── PesanFormScreen.js    # Pemesan: buat pesanan
│   ├── RiwayatScreen.js      # Pemesan: riwayat
│   ├── KelolaScreen.js       # Admin: kelola pesanan + stok keluar
│   ├── BahanScreen.js        # Admin: bahan & mutasi
│   ├── ProduksiScreen.js     # Produksi: antrian + selesai
│   └── LaporanScreen.js      # Admin: laporan keuangan
├── app.json / package.json / babel.config.js
└── assets/icon.png
```

## ✅ Status

- Semua source lulus `node --check`
- `expo export --platform android` **berhasil** (Hermes bundle 1.83 MB, 0 error)
- Note: perlu **Node 18** saat menjalankan expo CLI (expo-sqlite v14 ESM tanpa ekstensi — Node 22 resolver ketat)

© 2026 Rumah Kue