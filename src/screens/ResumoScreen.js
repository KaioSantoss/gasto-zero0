import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { CATEGORIAS } from '../constants/categorias';
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

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const verde = colors.primary ?? '#115e4b';
const fundo = colors.background ?? '#f5f7f6';
const texto = colors.text ?? '#1b2a26';

function moeda(n) {
  const [inteiro, centavos] = Number(n).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}

// Aceita string ISO, Date ou Timestamp do Firestore
function paraData(valor) {
  if (!valor) return null;
  const d = valor?.toDate ? valor.toDate() : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

function totalDoMes(gastos, ano, mes) {
  return gastos.reduce((soma, g) => {
    const d = paraData(g.data);
    return d && d.getFullYear() === ano && d.getMonth() === mes
      ? soma + (Number(g.valor) || 0)
      : soma;
  }, 0);
}

export default function ResumoScreen() {
  const { user } = useAuth();
  const hoje = new Date();

  const [selecionado, setSelecionado] = useState(null); // chave = ano * 12 + mês
  const [gastos, setGastos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Recarrega sempre que a aba ganha foco
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

  // Meses que têm gastos, do mais recente para o mais antigo
  const meses = useMemo(() => {
    const chaves = new Set();
    gastos.forEach((g) => {
      const d = paraData(g.data);
      if (d) chaves.add(d.getFullYear() * 12 + d.getMonth());
    });
    return [...chaves].sort((a, b) => b - a);
  }, [gastos]);

  const chaveAtual =
    selecionado !== null && meses.includes(selecionado)
      ? selecionado
      : meses[0] ?? hoje.getFullYear() * 12 + hoje.getMonth();

  const ano = Math.floor(chaveAtual / 12);
  const mes = chaveAtual % 12;
  const idx = meses.indexOf(chaveAtual);
  const anterior = idx >= 0 ? meses[idx + 1] : undefined; // mês mais antigo
  const proximo = idx > 0 ? meses[idx - 1] : undefined; // mês mais novo

  const resumo = useMemo(() => {
    const doMes = gastos.filter((g) => {
      const d = paraData(g.data);
      return d && d.getFullYear() === ano && d.getMonth() === mes;
    });

    const total = doMes.reduce((s, g) => s + (Number(g.valor) || 0), 0);

    const porCategoria = CATEGORIAS.map((cat) => {
      const valor = doMes
        .filter((g) => g.categoria === cat)
        .reduce((s, g) => s + (Number(g.valor) || 0), 0);
      return { cat, valor };
    })
      .filter((c) => c.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    const mesAnt = mes === 0 ? 11 : mes - 1;
    const anoAnt = mes === 0 ? ano - 1 : ano;
    const totalAnterior = totalDoMes(gastos, anoAnt, mesAnt);

    return { total, porCategoria, quantidade: doMes.length, totalAnterior, mesAnt };
  }, [gastos, ano, mes]);

  const { total, porCategoria, quantidade, totalAnterior, mesAnt } = resumo;
  const diferenca = total - totalAnterior;
  const maior = porCategoria[0]?.valor ?? 0;

  let comparacao = '';
  if (totalAnterior === 0 && total === 0) {
    comparacao = '';
  } else if (totalAnterior === 0) {
    comparacao = `Sem gastos em ${MESES[mesAnt]} para comparar.`;
  } else {
    const pct = Math.abs((diferenca / totalAnterior) * 100).toFixed(0);
    if (diferenca > 0) comparacao = `▲ ${pct}% a mais que em ${MESES[mesAnt]} (${moeda(diferenca)})`;
    else if (diferenca < 0) comparacao = `▼ ${pct}% a menos que em ${MESES[mesAnt]} (${moeda(-diferenca)})`;
    else comparacao = `Igual a ${MESES[mesAnt]}.`;
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {/* Seletor de mês (só meses com gastos) */}
      <View style={styles.seletor}>
        <TouchableOpacity
          onPress={() => anterior !== undefined && setSelecionado(anterior)}
          disabled={anterior === undefined}
          style={[styles.seta, anterior === undefined && { opacity: 0.3 }]}
        >
          <Text style={styles.setaTexto}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.mesTexto}>
          {MESES[mes]} de {ano}
        </Text>

        <TouchableOpacity
          onPress={() => proximo !== undefined && setSelecionado(proximo)}
          disabled={proximo === undefined}
          style={[styles.seta, proximo === undefined && { opacity: 0.3 }]}
        >
          <Text style={styles.setaTexto}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total gasto no mês</Text>
        <Text style={styles.heroValor}>{moeda(total)}</Text>
        <Text style={styles.heroInfo}>
          {quantidade} {quantidade === 1 ? 'gasto' : 'gastos'}
        </Text>
        {!!comparacao && <Text style={styles.heroComparacao}>{comparacao}</Text>}
      </View>

      {carregando && <ActivityIndicator style={{ marginTop: 24 }} color={verde} />}
      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      {/* Por categoria */}
      {!carregando && !erro && (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Por categoria</Text>

          {porCategoria.length === 0 ? (
            <Text style={styles.vazio}>Nenhum gasto neste mês.</Text>
          ) : (
            porCategoria.map(({ cat, valor }) => {
              const pctTotal = total > 0 ? (valor / total) * 100 : 0;
              const larguraBarra = maior > 0 ? (valor / maior) * 100 : 0;
              return (
                <View key={cat} style={styles.linha}>
                  <View style={styles.linhaTopo}>
                    <Text style={styles.linhaNome}>
                      {ICONES[cat] ?? '📦'} {cat}
                    </Text>
                    <Text style={styles.linhaValor}>
                      {moeda(valor)}{' '}
                      <Text style={styles.linhaPct}>({pctTotal.toFixed(0)}%)</Text>
                    </Text>
                  </View>
                  <View style={styles.barraFundo}>
                    <View style={[styles.barra, { width: `${larguraBarra}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: fundo },
  conteudo: { padding: 16, paddingBottom: 32 },

  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seta: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e1e6e4',
  },
  setaTexto: { fontSize: 26, color: verde, lineHeight: 30, fontWeight: '700' },
  mesTexto: { fontSize: 18, fontWeight: '700', color: texto },

  hero: {
    backgroundColor: verde,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroValor: { color: '#fff', fontSize: 38, fontWeight: '800', marginTop: 6 },
  heroInfo: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  heroComparacao: {
    color: '#fff',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },

  cartao: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cartaoTitulo: { fontSize: 16, fontWeight: '700', color: texto, marginBottom: 12 },
  vazio: { color: '#7a8984', fontSize: 14, paddingVertical: 8 },

  linha: { marginBottom: 16 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  linhaNome: { fontSize: 15, color: texto },
  linhaValor: { fontSize: 15, fontWeight: '700', color: texto },
  linhaPct: { fontWeight: '400', color: '#7a8984', fontSize: 13 },
  barraFundo: { height: 8, borderRadius: 4, backgroundColor: '#e8ecea', overflow: 'hidden' },
  barra: { height: 8, borderRadius: 4, backgroundColor: verde },

  erro: { color: '#c62828', textAlign: 'center', marginTop: 20 },
});