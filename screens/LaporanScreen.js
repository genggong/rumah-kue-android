import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getDb } from '../db';

export default function LaporanScreen({ route }) {
  // Dibuka dari Home — ambil data ringkas laporan bulan ini dari SQLite
  const [rows, setRows] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const db = getDb();
        const dari = new Date().toISOString().slice(0, 8) + '01';
        const sampai = new Date().toISOString().slice(0, 10);
        const summary = await db.getFirstAsync(
          'SELECT COUNT(*) jml, COALESCE(SUM(CASE WHEN status != "batal" THEN total ELSE 0 END),0) omzet FROM pesanan WHERE tanggal BETWEEN ? AND ?',
          [dari, sampai]
        );
        const per = await db.getAllAsync(
          `SELECT pr.nama, SUM(pi.qty) qty, SUM(pi.qty*pi.harga) omzet,
                  SUM(pi.qty * COALESCE((SELECT SUM(pb.qty*b.harga_satuan) FROM produk_bahan pb JOIN bahan_baku b ON b.id=pb.bahan_id WHERE pb.produk_id=pi.produk_id),0)) hpp
           FROM pesanan_item pi JOIN produk pr ON pr.id=pi.produk_id
           JOIN pesanan p ON p.id=pi.pesanan_id
           WHERE p.tanggal BETWEEN ? AND ? AND p.status != "batal"
           GROUP BY pr.id`, [dari, sampai]
        );
        setRows({ summary, per });
      } catch (e) {
        Alert.alert('Gagal', String(e.message || e));
      }
    })();
  }, []);

  const money = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');
  const omzet = rows ? Number(rows.summary.omzet || 0) : 0;
  const hpp = rows ? rows.per.reduce((s, r) => s + Number(r.hpp || 0), 0) : 0;
  const laba = omzet - hpp;
  const margin = omzet > 0 ? (laba / omzet * 100).toFixed(1) : '0.0';

  return (
    <View style={{ flex: 1, backgroundColor: '#fdf6ec', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#5a3a1a' }}>📊 Laporan Keuangan (bulan ini)</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }}>
        <Stat label="Pesanan" value={rows ? String(rows.summary.jml) : '—'} color="#8d5524" />
        <Stat label="Omzet" value={rows ? money(omzet) : '—'} color="#1e8449" />
        <Stat label="Laba Kotor" value={rows ? money(laba) : '—'} color="#1f618d" />
        <Stat label="Margin" value={rows ? margin + '%' : '—'} color="#b7950b" />
      </View>

      <Text style={{ marginTop: 20, fontWeight: '800', color: '#5a3a1a' }}>Penjualan per Produk</Text>
      {!rows && <Text style={{ color: '#999', marginTop: 8 }}>Memuat...</Text>}
      {rows && rows.per.length === 0 && <Text style={{ color: '#999', marginTop: 8 }}>Tidak ada data periode ini.</Text>}
      {rows && rows.per.map((r, i) => {
        const lb = Number(r.omzet) - Number(r.hpp || 0);
        return (
          <View key={i} style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontWeight: '700', color: '#333' }}>{r.nama}</Text>
              <Text style={{ fontSize: 12, color: '#999' }}>Qty {r.qty} • HPP {money(r.hpp)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '800', color: '#333' }}>{money(r.omzet)}</Text>
              <Text style={{ fontSize: 12, color: lb >= 0 ? '#1e8449' : '#c0392b' }}>Laba {money(lb)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, marginRight: '2%' }}>
      <Text style={{ fontSize: 11, color: '#999' }}>{label}</Text>
      <Text style={{ fontSize: 17, fontWeight: '800', color }} numberOfLines={1}>{value}</Text>
    </View>
  );
}