import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { getDb } from '../db';

export default function RiwayatScreen({ route }) {
  const user = route.params?.user || {};
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const db = getDb();
        const r = await db.getAllAsync(
          'SELECT * FROM pesanan WHERE pemesan_id = ? ORDER BY id DESC', [user.id]
        );
        setRows(r);
      } catch (e) {
        Alert.alert('Gagal', String(e.message || e));
      }
    })();
  }, []);

  const label = { baru: '🆕 Baru', verifikasi: '✅ Verifikasi', produksi: '👨‍🍳 Produksi', selesai: '🏁 Selesai', batal: '❌ Batal' };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fdf6ec', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#5a3a1a', marginBottom: 12 }}>📜 Riwayat Saya</Text>
      {rows.length === 0 && <Text style={{ color: '#999' }}>Belum ada pesanan.</Text>}
      {rows.map((p) => (
        <View key={p.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: '#333' }}>{p.no_pesanan}</Text>
            <Text>{label[p.status] || p.status}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            🗓 {p.tanggal} {p.jam} • {p.catatan ? p.catatan : ''}
          </Text>
          <Text style={{ fontWeight: '900', color: '#8d5524', marginTop: 6 }}>
            Rp {Number(p.total).toLocaleString('id-ID')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}