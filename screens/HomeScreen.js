import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  const user = route.params?.user || {};

  const menus = [];
  if (user.role === 'pemesan') {
    menus.push({ key: 'PesanForm', icon: '🍰', title: 'Buat Pesanan', desc: 'Pilih kue/paket nasi, tanggal & jam' });
    menus.push({ key: 'Riwayat', icon: '📜', title: 'Riwayat Saya', desc: 'Pantau status pesanan' });
  }
  if (user.role === 'admin') {
    menus.push({ key: 'Kelola', icon: '📋', title: 'Kelola Pesanan', desc: 'Verifikasi → produksi, cek stok' });
    menus.push({ key: 'Bahan', icon: '🥚', title: 'Bahan Baku & Stok', desc: 'Bahan, harga, mutasi' });
    menus.push({ key: 'Produksi', icon: '👨‍🍳', title: 'Antrian Produksi', desc: 'Timeline pengerjaan' });
    menus.push({ key: 'Laporan', icon: '📊', title: 'Laporan Keuangan', desc: 'Omzet, HPP, laba, margin' });
  }
  if (user.role === 'produksi') {
    menus.push({ key: 'Produksi', icon: '👨‍🍳', title: 'Antrian Produksi', desc: 'Urut tanggal & jam, tandai selesai' });
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.halo}>Halo, {user.nama || user.username} 👋</Text>
      <Text style={styles.role}>Role: {user.role}</Text>

      {menus.map((m) => (
        <TouchableOpacity key={m.key} style={styles.card} onPress={() => navigation.navigate(m.key, { user })}>
          <Text style={styles.icon}>{m.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{m.title}</Text>
            <Text style={styles.desc}>{m.desc}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logout} onPress={() => navigation.replace('Login')}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fdf6ec' },
  halo: { fontSize: 22, fontWeight: '800', color: '#5a3a1a' },
  role: { fontSize: 13, color: '#999', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  icon: { fontSize: 28, marginRight: 14 },
  title: { fontSize: 16, fontWeight: '700', color: '#333' },
  desc: { fontSize: 12, color: '#999', marginTop: 2 },
  arrow: { fontSize: 22, color: '#ccc' },
  logout: { marginTop: 16, alignItems: 'center', padding: 12 },
  logoutText: { color: '#c0392b', fontWeight: '700' },
});