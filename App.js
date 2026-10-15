import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { initDb } from './db';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PesanFormScreen from './screens/PesanFormScreen';
import RiwayatScreen from './screens/RiwayatScreen';
import KelolaScreen from './screens/KelolaScreen';
import ProduksiScreen from './screens/ProduksiScreen';
import BahanScreen from './screens/BahanScreen';
import LaporanScreen from './screens/LaporanScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDb();
      } catch (e) {
        console.warn('init db gagal', e);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#8d5524" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#8d5524' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Masuk — Rumah Kue' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Rumah Kue' }} />
        <Stack.Screen name="PesanForm" component={PesanFormScreen} options={{ title: 'Buat Pesanan' }} />
        <Stack.Screen name="Riwayat" component={RiwayatScreen} options={{ title: 'Riwayat Saya' }} />
        <Stack.Screen name="Kelola" component={KelolaScreen} options={{ title: 'Kelola Pesanan' }} />
        <Stack.Screen name="Produksi" component={ProduksiScreen} options={{ title: 'Antrian Produksi' }} />
        <Stack.Screen name="Bahan" component={BahanScreen} options={{ title: 'Bahan Baku & Stok' }} />
        <Stack.Screen name="Laporan" component={LaporanScreen} options={{ title: 'Laporan Keuangan' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}