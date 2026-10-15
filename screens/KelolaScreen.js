import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getDb } from '../db';

const STATUS = ['baru', 'verifikasi', 'produksi', 'selesai', 'batal'];
const LABEL = { baru: '🆕 Baru', verifikasi: '✅ Verifikasi', produksi: '👨‍🍳 Produksi', selesai: '🏁 Selesai', batal: '❌ Batal' };

export default function KelolaScreen({ route }) {
  const [rows, setRows] = useState([]);

  async function load() {
    try {
      const db = getDb();
      const r = await db.getAllAsync(
        `SELECT p.*, u.nama pemesan FROM pesanan p JOIN users u ON u.id = p.pemesan_id ORDER BY p.id DESC`
      );
      setRows(r);
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }
  useEffect(() => { load(); }, []);

  const money = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  async function setStatus(id, to) {
    const db = getDb();
    try {
      await db.runAsync('UPDATE pesanan SET status = ? WHERE id = ?', [to, id]);
      await db.runAsync('INSERT INTO timeline (pesanan_id, tahap, catatan) VALUES (?,?,?)', [id, to, 'Status diubah admin']);
      // Saat status jadi produksi: kurangi stok bahan (bila resep ada)
      if (to === 'produksi') {
        const items = await db.getAllAsync('SELECT * FROM pesanan_item WHERE pesanan_id = ?', [id]);
        for (const it of items) {
          const resep = await db.getAllAsync('SELECT * FROM produk_bahan WHERE produk_id = ?', [it.produk_id]);
          for (const rb of resep) {
            await db.runAsync('UPDATE bahan_baku SET stok = stok - ? WHERE id = ?', [rb.qty * it.qty, rb.bahan_id]);
            await db.runAsync(
              'INSERT INTO stok_mutasi (bahan_id, pesanan_id, jenis, jumlah, catatan) VALUES (?,?,?,?,?)',
              [rb.bahan_id, id, 'keluar', rb.qty * it.qty, 'Produksi pesanan']
            );
          }
        }
      }
      load();
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fdf6ec', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#5a3a1a', marginBottom: 12 }}>📋 Kelola Pesanan</Text>
      {rows.length === 0 && <Text style={{ color: '#999' }}>Belum ada pesanan.</Text>}
      {rows.map((p) => (
        <View key={p.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: '#333' }}>{p.no_pesanan}</Text>
            <Text>{LABEL[p.status] || p.status}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>🧑 {p.pemesan} • 🗓 {p.tanggal} {p.jam}</Text>
          <Text style={{ fontWeight: '900', color: '#8d5524', marginTop: 4 }}>{money(p.total)}</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {STATUS.map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setStatus(p.id, st)}
                style={{
                  paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6, marginBottom: 6,
                  backgroundColor: p.status === st ? '#8d5524' : '#f1e6d6',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: p.status === st ? '#fff' : '#8d5524' }}>
                  {LABEL[st].replace(/^\S+\s/, '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}