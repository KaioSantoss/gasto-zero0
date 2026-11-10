import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* TODO (Pessoa 3): envolver com AuthProvider e GastosProvider */}
      <StatusBar style="light" />
      <Navigation />
    </SafeAreaProvider>
  );
}
