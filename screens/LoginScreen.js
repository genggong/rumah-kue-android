import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { login } from '../db';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function doLogin() {
    if (!username || !password) { setErr('Username & password wajib diisi.'); return; }
    const u = await login(username.trim(), password);
    if (!u) { setErr('Username atau password salah.'); return; }
    navigation.replace('Home', { user: u });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.title}>🍰 Rumah Kue</Text>
        <Text style={styles.sub}>Manajemen Pesanan Kue & Paket Nasi</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="admin / produksi / pemesan" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        {err !== '' && <Text style={styles.err}>{err}</Text>}

        <TouchableOpacity style={styles.btn} onPress={doLogin}>
          <Text style={styles.btnText}>Masuk</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Akun demo: admin/admin123 • produksi/produksi123 • pemesan/pemesan123</Text>
        <Text style={styles.offline}>📶 Mode offline — data tersimpan di HP (SQLite lokal)</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fdf6ec', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 3 },
  title: { fontSize: 26, fontWeight: '800', color: '#8d5524', textAlign: 'center' },
  sub: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#e5d9c8', borderRadius: 10, padding: 12, fontSize: 15, marginTop: 6, backgroundColor: '#fdf9f2' },
  err: { color: '#c0392b', marginTop: 8, fontSize: 13 },
  btn: { backgroundColor: '#8d5524', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 18 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 16 },
  offline: { fontSize: 11, color: '#8d5524', textAlign: 'center', marginTop: 6 },
});