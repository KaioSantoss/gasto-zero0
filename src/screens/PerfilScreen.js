import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { listarGastos } from '../services/gastosService';

const ICONES = {
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

function moeda(n) {
  const [inteiro, centavos] = Number(n).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}

function paraData(valor) {
  if (!valor) return null;
  const d = valor?.toDate ? valor.toDate() : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

function nomeDoEmail(email) {
  const base = (email ?? '').split('@')[0].replace(/[._\d]+/g, ' ').trim();
  if (!base) return 'Usuário';
  return base
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ quantidade: 0, totalMes: 0, topCategoria: null });

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      async function carregar() {
        if (!user) return;
        try {
          const lista = await listarGastos(user.uid);
          const hoje = new Date();
          let totalMes = 0;
          const porCat = {};

          lista.forEach((g) => {
            const valor = Number(g.valor) || 0;
            porCat[g.categoria] = (porCat[g.categoria] ?? 0) + 1;
            const d = paraData(g.data);
            if (d && d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth()) {
              totalMes += valor;
            }
          });

          const top = Object.entries(porCat).sort((a, b) => b[1] - a[1])[0];
          if (ativo) {
            setStats({
              quantidade: lista.length,
              totalMes,
              topCategoria: top ? top[0] : null,
            });
          }
        } catch (e) {
          // Estatísticas são opcionais: se falhar, mantém zeradas
        }
      }
      carregar();
      return () => {
        ativo = false;
      };
    }, [user])
  );

  function confirmarSaida() {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja sair da sua conta?')) logout();
      return;
    }
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  const email = user?.email ?? 'Não logado';
  const nome = nomeDoEmail(user?.email);
  const inicial = (user?.email ?? '?').charAt(0).toUpperCase();
  const criadaEm = paraData(user?.metadata?.creationTime);
  const desde = criadaEm
    ? criadaEm.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {/* Cabeçalho */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValor}>{stats.quantidade}</Text>
          <Text style={styles.statRotulo}>
            {stats.quantidade === 1 ? 'gasto' : 'gastos'}
          </Text>
        </View>
        <View style={styles.divisor} />
        <View style={[styles.stat, { flex: 1.4 }]}>
          <Text style={styles.statValor} numberOfLines={1} adjustsFontSizeToFit>
            {moeda(stats.totalMes)}
          </Text>
          <Text style={styles.statRotulo}>neste mês</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.stat}>
          <Text style={styles.statValor}>
            {stats.topCategoria ? ICONES[stats.topCategoria] ?? '📦' : '—'}
          </Text>
          <Text style={styles.statRotulo} numberOfLines={1}>
            {stats.topCategoria ?? 'sem dados'}
          </Text>
        </View>
      </View>

      {/* Conta */}
      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Conta</Text>
        <View style={[styles.linha, styles.linhaBorda]}>
          <Text style={styles.linhaRotulo}>✉️  E-mail</Text>
          <Text style={styles.linhaValor} numberOfLines={1}>{email}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.linhaRotulo}>📅  Membro desde</Text>
          <Text style={styles.linhaValor}>{desde}</Text>
        </View>
      </View>

      {/* Sair */}
      <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida} activeOpacity={0.8}>
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.versao}>Gasto Zero</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: fundo },
  conteudo: { paddingBottom: 32 },

  hero: {
    backgroundColor: verde,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 64,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: '#fff', fontSize: 40, fontWeight: '800' },
  nome: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 12 },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -36,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  statValor: { fontSize: 20, fontWeight: '800', color: verde },
  statRotulo: { fontSize: 12, color: '#7a8984', marginTop: 4 },
  divisor: { width: 1, backgroundColor: '#e8ecea' },

  cartao: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cartaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5b6b66',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  linhaBorda: { borderBottomWidth: 1, borderBottomColor: '#e8ecea' },
  linhaRotulo: { fontSize: 14, color: '#7a8984' },
  linhaValor: { fontSize: 14, fontWeight: '600', color: texto, flexShrink: 1, marginLeft: 12 },

  botaoSair: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#c62828',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoSairTexto: { color: '#c62828', fontSize: 16, fontWeight: '700' },
  versao: { textAlign: 'center', color: '#9aa5a1', fontSize: 12, marginTop: 20 },
});