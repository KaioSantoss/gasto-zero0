import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { listarGastos } from '../services/gastosService';

export const ICONES = {
  Alimentação: '🍽️',
  Transporte: '🚌',
  Moradia: '🏠',
  Lazer: '🎮',
  Saúde: '💊',
  Educação: '📚',
  Outros: '📦',
};

const verde = colors.primary ?? '#115e4b';
const fundo = colors.background ?? '#f5f7f6';
const texto = colors.text ?? '#1b2a26';

export function moeda(n) {
  const [inteiro, centavos] = Number(n).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}

export function dataBR(valor) {
  const d = valor?.toDate ? valor.toDate() : new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export default function GastosScreen({ navigation }) {
  const { user } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      async function carregar() {
        if (!user) return;
        setCarregando(true);
        setErro('');
        try {
          const lista = await listarGastos(user.uid);
          if (ativo) setGastos(lista);
        } catch (e) {
          if (ativo) setErro(`Não foi possível carregar (${e.code ?? e.message}).`);
        } finally {
          if (ativo) setCarregando(false);
        }
      }
      carregar();
      return () => {
        ativo = false;
      };
    }, [user])
  );

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('DetalhesGasto', { id: item.id })}
      >
        <View style={styles.icone}>
          <Text style={styles.iconeTexto}>{ICONES[item.categoria] ?? '📦'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.descricao} numberOfLines={1}>{item.descricao}</Text>
          <Text style={styles.sub}>
            {item.categoria} · {dataBR(item.data)}
          </Text>
        </View>
        <Text style={styles.valor}>{moeda(item.valor)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.tela}>
      {carregando ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={verde} size="large" />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(g) => g.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.vazioBox}>
              <Text style={styles.vazioEmoji}>🧾</Text>
              <Text style={styles.vazio}>Nenhum gasto ainda.</Text>
              <Text style={styles.vazioSub}>Toque em + para adicionar o primeiro.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NovoGasto')}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: fundo },
  lista: { padding: 16, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f1ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconeTexto: { fontSize: 20 },
  info: { flex: 1 },
  descricao: { fontSize: 16, fontWeight: '600', color: texto },
  sub: { fontSize: 13, color: '#7a8984', marginTop: 2 },
  valor: { fontSize: 16, fontWeight: '700', color: texto, marginLeft: 8 },

  vazioBox: { alignItems: 'center', marginTop: 80 },
  vazioEmoji: { fontSize: 48 },
  vazio: { fontSize: 17, fontWeight: '600', color: texto, marginTop: 8 },
  vazioSub: { fontSize: 14, color: '#7a8984', marginTop: 4 },
  erro: { color: '#c62828', textAlign: 'center', marginTop: 40, padding: 16 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: verde,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabTexto: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '400' },
});