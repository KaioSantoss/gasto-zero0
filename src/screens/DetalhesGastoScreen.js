import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme';
import { buscarGasto, removerGasto } from '../services/gastosService';
import { ICONES, moeda, dataBR } from './GastosScreen';

const verde = colors.primary ?? '#115e4b';
const fundo = colors.background ?? '#f5f7f6';
const texto = colors.text ?? '#1b2a26';

export default function DetalhesGastoScreen({ route, navigation }) {
  const id = route.params?.id;
  const [gasto, setGasto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const g = await buscarGasto(id);
        if (ativo) {
          setGasto(g);
          if (!g) setErro('Gasto não encontrado.');
        }
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
  }, [id]);

  async function excluir() {
    setExcluindo(true);
    try {
      await removerGasto(id);
      navigation.goBack();
    } catch (e) {
      setErro(`Não foi possível excluir (${e.code ?? e.message}).`);
      setExcluindo(false);
    }
  }

  function confirmarExclusao() {
    if (Platform.OS === 'web') {
      // Alert com botões não funciona na web
      if (window.confirm('Excluir este gasto?')) excluir();
      return;
    }
    Alert.alert('Excluir gasto', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: excluir },
    ]);
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={verde} />
      </View>
    );
  }

  if (erro && !gasto) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <View style={styles.hero}>
        <Text style={styles.heroIcone}>{ICONES[gasto.categoria] ?? '📦'}</Text>
        <Text style={styles.heroValor}>{moeda(gasto.valor)}</Text>
        <Text style={styles.heroDesc}>{gasto.descricao}</Text>
      </View>

      <View style={styles.cartao}>
        <Linha rotulo="Categoria" valor={gasto.categoria} />
        <Linha rotulo="Data" valor={dataBR(gasto.data)} ultima />
      </View>

      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      <TouchableOpacity
        style={[styles.botaoExcluir, excluindo && { opacity: 0.6 }]}
        onPress={confirmarExclusao}
        disabled={excluindo}
      >
        {excluindo ? (
          <ActivityIndicator color="#c62828" />
        ) : (
          <Text style={styles.botaoExcluirTexto}>Excluir gasto</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function Linha({ rotulo, valor, ultima }) {
  return (
    <View style={[styles.linha, !ultima && styles.linhaBorda]}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: fundo, padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: fundo },
  hero: {
    backgroundColor: verde,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  heroIcone: { fontSize: 40 },
  heroValor: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 8 },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 4, textAlign: 'center' },

  cartao: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  linhaBorda: { borderBottomWidth: 1, borderBottomColor: '#e8ecea' },
  linhaRotulo: { fontSize: 14, color: '#7a8984' },
  linhaValor: { fontSize: 15, fontWeight: '600', color: texto },

  erro: { color: '#c62828', textAlign: 'center', marginTop: 16 },
  botaoExcluir: {
    borderWidth: 1,
    borderColor: '#c62828',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#fff',
  },
  botaoExcluirTexto: { color: '#c62828', fontSize: 16, fontWeight: '700' },
});