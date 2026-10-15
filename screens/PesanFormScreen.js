import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { getDb } from '../db';

export default function PesanFormScreen({ navigation, route }) {
  const user = route.params?.user || {};
  const [produk, setProduk] = useState([]);
  const [cart, setCart] = useState({}); // {produkId: qty}
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jam, setJam] = useState('12:00');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const db = getDb();
        const rows = await db.getAllAsync(
          'SELECT * FROM produk WHERE aktif = 1 ORDER BY nama'
        );
        setProduk(rows);
      } catch (e) {
        Alert.alert('Gagal', String(e.message || e));
      }
      setLoading(false);
    })();
  }, []);

  const money = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  function toggle(id) {
    setCart((c) => {
      const n = { ...c };
      if (n[id]) delete n[id];
      else n[id] = 1;
      return n;
    });
  }
  function setQty(id, v) {
    setCart((c) => {
      const n = { ...c };
      const q = Math.max(1, Number(v) || 1);
      n[id] = q;
      return n;
    });
  }

  const ids = Object.keys(cart).map(Number);
  const total = ids.reduce((s, id) => {
    const p = produk.find((x) => x.id === id);
    return s + (p ? p.harga_jual * cart[id] : 0);
  }, 0);

  async function submit() {
    if (ids.length === 0) { Alert.alert('Pilih produk', 'Belum ada produk dipilih.'); return; }
    const db = getDb();
    try {
      const no = 'RK-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') +
        '-' + Math.random().toString(16).slice(2, 6).toUpperCase();
      const res = await db.runAsync(
        'INSERT INTO pesanan (no_pesanan, pemesan_id, tanggal, jam, status, catatan, total) VALUES (?,?,?,?,?,?,?)',
        [no, user.id, tanggal, jam, 'baru', catatan, total]
      );
      const pid = res.lastInsertRowId;
      for (const id of ids) {
        const p = produk.find((x) => x.id === id);
        await db.runAsync(
          'INSERT INTO pesanan_item (pesanan_id, produk_id, qty, harga) VALUES (?,?,?,?)',
          [pid, id, cart[id], p.harga_jual]
        );
      }
      await db.runAsync(
        'INSERT INTO timeline (pesanan_id, tahap, catatan) VALUES (?,?,?)',
        [pid, 'baru', 'Pesanan dibuat pemesan (offline)']
      );
      Alert.alert('Berhasil', 'Pesanan ' + no + ' tersimpan di HP. Terkirim ke admin saat online.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fdf6ec', padding: 16 }}>
      <Text style={s.title}>Pilih Produk</Text>
      {loading && <Text style={{ color: '#999' }}>Memuat...</Text>}
      {produk.map((p) => {
        const qty = cart[p.id];
        return (
          <TouchableOpacity key={p.id} style={[s.row, qty ? s.rowOn : null]} onPress={() => toggle(p.id)}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: '#333' }}>{p.nama}</Text>
              <Text style={{ fontSize: 12, color: '#999' }}>{p.kategori} • {money(p.harga_jual)}</Text>
            </View>
            {qty ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setQty(p.id, qty - 1)} style={s.qBtn}><Text>−</Text></TouchableOpacity>
                <TextInput style={s.qInput} value={String(qty)} keyboardType="number-pad" onChangeText={(v) => setQty(p.id, v)} />
                <TouchableOpacity onPress={() => setQty(p.id, qty + 1)} style={s.qBtn}><Text>+</Text></TouchableOpacity>
              </View>
            ) : (
              <Text style={{ fontSize: 22, color: '#ccc' }}>+</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <Text style={[s.title, { marginTop: 20 }]}>Tanggal & Jam Pengambilan</Text>
      <TextInput style={s.input} value={tanggal} onChangeText={setTanggal} placeholder="YYYY-MM-DD" />
      <TextInput style={s.input} value={jam} onChangeText={setJam} placeholder="HH:MM" />
      <TextInput style={s.input} value={catatan} onChangeText={setCatatan} placeholder="Catatan (opsional)" />

      <View style={s.totalBar}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#5a3a1a' }}>Total</Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#8d5524' }}>{money(total)}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={submit}>
        <Text style={s.btnText}>Simpan Pesanan (Offline)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: '#5a3a1a', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, justifyContent: 'space-between' },
  rowOn: { borderWidth: 2, borderColor: '#8d5524' },
  qBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1e6d6', alignItems: 'center', justifyContent: 'center' },
  qInput: { width: 44, textAlign: 'center', fontSize: 16, fontWeight: '700', marginHorizontal: 4 },
  input: { borderWidth: 1, borderColor: '#e5d9c8', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10, backgroundColor: '#fff' },
  totalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  btn: { backgroundColor: '#8d5524', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});