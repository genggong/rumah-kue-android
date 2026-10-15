import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { getDb } from '../db';

export default function BahanScreen({ route }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null); // null | {mode:'add'} | {mode:'edit', b}
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('pcs');
  const [harga, setHarga] = useState('');
  const [minStok, setMinStok] = useState('');
  const [mutasi, setMutasi] = useState(null); // null | {b, jenis}
  const [jml, setJml] = useState('');

  async function load() {
    try {
      const db = getDb();
      const r = await db.getAllAsync('SELECT * FROM bahan_baku ORDER BY nama');
      setRows(r);
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }
  useEffect(() => { load(); }, []);

  const money = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  async function save() {
    const db = getDb();
    try {
      if (modal.mode === 'add') {
        await db.runAsync(
          'INSERT INTO bahan_baku (nama, satuan, stok, harga_satuan, min_stok) VALUES (?,?,?,?,?)',
          [nama.trim(), satuan, 0, Number(harga) || 0, Number(minStok) || 0]
        );
      } else {
        await db.runAsync(
          'UPDATE bahan_baku SET nama=?, satuan=?, harga_satuan=?, min_stok=? WHERE id=?',
          [nama.trim(), satuan, Number(harga) || 0, Number(minStok) || 0, modal.b.id]
        );
      }
      setModal(null);
      load();
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }

  async function doMutasi() {
    const db = getDb();
    const q = Number(jml) || 0;
    if (q <= 0) { Alert.alert('Jumlah salah', 'Isi jumlah > 0.'); return; }
    try {
      const delta = mutasi.jenis === 'masuk' ? q : -q;
      await db.runAsync('UPDATE bahan_baku SET stok = stok + ? WHERE id = ?', [delta, mutasi.b.id]);
      await db.runAsync(
        'INSERT INTO stok_mutasi (bahan_id, jenis, jumlah, catatan) VALUES (?,?,?,?)',
        [mutasi.b.id, mutasi.jenis, q, mutasi.jenis === 'masuk' ? 'Beli bahan' : 'Koreksi stok']
      );
      setMutasi(null);
      setJml('');
      load();
    } catch (e) {
      Alert.alert('Gagal', String(e.message || e));
    }
  }

  function openEdit(b) {
    setModal({ mode: 'edit', b });
    setNama(b.nama); setSatuan(b.satuan); setHarga(String(b.harga_satuan)); setMinStok(String(b.min_stok));
  }
  function openAdd() {
    setModal({ mode: 'add' });
    setNama(''); setSatuan('pcs'); setHarga(''); setMinStok('');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fdf6ec', padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#5a3a1a' }}>🥚 Bahan Baku & Stok</Text>
        <TouchableOpacity onPress={openAdd} style={{ backgroundColor: '#8d5524', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {rows.map((b) => (
          <View key={b.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', color: '#333' }}>{b.nama}</Text>
              <Text style={{ fontWeight: '900', color: b.stok <= b.min_stok ? '#c0392b' : '#8d5524' }}>
                {b.stok} {b.satuan}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Harga {money(b.harga_satuan)}/{b.satuan} • Min {b.min_stok}
              {b.stok <= b.min_stok ? ' ⚠️ Menipis' : ''}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setMutasi({ b, jenis: 'masuk' }); setJml(''); }} style={btnStyle('#1e8449')}>
                <Text style={btnText}>+ Masuk</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMutasi({ b, jenis: 'koreksi' }); setJml(''); }} style={btnStyle('#c0392b')}>
                <Text style={btnText}>− Keluar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openEdit(b)} style={btnStyle('#8d5524')}>
                <Text style={btnText}>✎ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {rows.length === 0 && <Text style={{ color: '#999' }}>Belum ada bahan.</Text>}
      </ScrollView>

      {/* Modal tambah/edit */}
      <Modal visible={modal !== null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#5a3a1a', marginBottom: 12 }}>
              {modal?.mode === 'add' ? 'Tambah Bahan' : 'Edit Bahan'}
            </Text>
            <TextInput style={i} placeholder="Nama bahan" value={nama} onChangeText={setNama} />
            <TextInput style={i} placeholder="Satuan (pcs/gram/liter)" value={satuan} onChangeText={setSatuan} />
            <TextInput style={i} placeholder="Harga satuan" value={harga} onChangeText={setHarga} keyboardType="number-pad" />
            <TextInput style={i} placeholder="Min stok" value={minStok} onChangeText={setMinStok} keyboardType="number-pad" />
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#eee', marginRight: 8 }} onPress={() => setModal(null)}>
                <Text style={{ textAlign: 'center', fontWeight: '700', color: '#666' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#8d5524' }} onPress={save}>
                <Text style={{ textAlign: 'center', fontWeight: '800', color: '#fff' }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal mutasi */}
      <Modal visible={mutasi !== null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#5a3a1a', marginBottom: 12 }}>
              {mutasi?.jenis === 'masuk' ? '+ ' : '− '}{mutasi?.b?.nama}
            </Text>
            <TextInput style={i} placeholder="Jumlah" value={jml} onChangeText={setJml} keyboardType="number-pad" />
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#eee', marginRight: 8 }} onPress={() => setMutasi(null)}>
                <Text style={{ textAlign: 'center', fontWeight: '700', color: '#666' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: mutasi?.jenis === 'masuk' ? '#1e8449' : '#c0392b' }} onPress={doMutasi}>
                <Text style={{ textAlign: 'center', fontWeight: '800', color: '#fff' }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const i = { borderWidth: 1, borderColor: '#e5d9c8', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10, backgroundColor: '#fdf9f2' };
const btnStyle = (c) => ({ backgroundColor: c, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 });
const btnText = { color: '#fff', fontWeight: '800', fontSize: 12 };