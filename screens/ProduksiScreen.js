import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getDb } from '../db';

export default function ProduksiScreen({ route }) {
  const [rows, setRows] = useState([]);

  async function load() {
    try {
      const db = getDb();
      const r = await db.getAllAsync(
        `SELECT * FROM pesanan WHERE status IN ('verifikasi','produksi') AND status != 'batal'
         ORDER BY tanggal ASC, jam ASC`
      );
      setRows(r);
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }
  useEffect(() => { load(); }, []);

  async function done(id) {
    try {
      const db = getDb();
      await db.runAsync("UPDATE pesanan SET status = 'selesai' WHERE id = ?", [id]);
      await db.runAsync('INSERT INTO timeline (pesanan_id, tahap, catatan) VALUES (?,?,?)', [id, 'selesai', 'Produksi selesai']);
      load();
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fdf6ec', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#5a3a1a', marginBottom: 4 }}>👨‍🍳 Antrian Produksi</Text>
      <Text style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>Urut tanggal & jam pengambilan</Text>
      {rows.length === 0 && <Text style={{ color: '#999' }}>Tidak ada antrian.</Text>}
      {rows.map((p) => (
        <View key={p.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <Text style={{ fontWeight: '800', color: '#333' }}>{p.no_pesanan}</Text>
          <Text style={{ fontSize: 13, color: '#666', marginTop: 4 }}>🗓 {p.tanggal} • ⏰ {p.jam}</Text>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{p.catatan || '—'}</Text>
          <Text style={{ fontWeight: '900', color: '#8d5524', marginTop: 6 }}>Rp {Number(p.total).toLocaleString('id-ID')}</Text>
          <TouchableOpacity
            onPress={() => done(p.id)}
            style={{ backgroundColor: '#1e8449', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>🏁 Tandai Selesai</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}