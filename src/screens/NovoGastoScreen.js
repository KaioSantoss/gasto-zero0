import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { CATEGORIAS } from '../constants/categorias';
import { useAuth } from '../context/AuthContext';
import { criarGasto } from '../services/gastosService';
import {
  validarGasto,
  converterValor,
  formatarData,
  dataParaISO,
} from '../utils/validacao';
import SeletorData from '../components/SeletorData';
import FotoRecibo from '../components/FotoRecibo';
import { vibrarSelecao, vibrarLeve, vibrarSucesso, vibrarErro } from '../utils/haptics';

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
const vermelho = '#c62828';

export default function NovoGastoScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(new Date()); // DATA: objeto Date, começa em hoje
  const [foto, setFoto] = useState(null); // FOTO: data URI do recibo (opcional)
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);

  function escolherCategoria(cat) {
    vibrarSelecao();
    setCategoria(cat);
  }

  function escolherData(novaData) {
    vibrarSelecao();
    setData(novaData);
  }

  function mudarFoto(novaFoto) {
    vibrarLeve();
    setErroGeral('');
    setFoto(novaFoto);
  }

  async function salvar() {
    setErroGeral('');
    const dataTexto = formatarData(data); // "DD/MM/AAAA", formato que o validador espera
    const errosEncontrados = validarGasto({ descricao, valor, categoria, data: dataTexto });
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) {
      vibrarErro();
      return;
    }

    setSalvando(true);
    try {
      await criarGasto({
        descricao: descricao.trim(),
        valor: converterValor(valor),
        categoria,
        data: dataParaISO(dataTexto),
        userId: user.uid,
        ...(foto ? { foto } : {}),
      });
      vibrarSucesso();
      navigation.goBack();
    } catch (e) {
      vibrarErro();
      console.log('Erro ao salvar:', e.code, e.message);
      setErroGeral(`Não foi possível salvar (${e.code ?? e.message}).`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Bloco do valor */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Quanto você gastou?</Text>
          <View style={styles.valorLinha}>
            <Text style={styles.moeda}>R$</Text>
            <TextInput
              style={styles.valorInput}
              value={valor}
              onChangeText={setValor}
              placeholder="0,00"
              placeholderTextColor="rgba(255,255,255,0.45)"
              keyboardType="decimal-pad"
              selectionColor="#fff"
            />
          </View>
          {!!erros.valor && <Text style={styles.erroHero}>{erros.valor}</Text>}
        </View>

        {/* Cartão com os demais campos */}
        <View style={styles.cartao}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, erros.descricao && styles.inputErro]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ex.: Almoço com a família"
            placeholderTextColor="#9aa5a1"
            maxLength={60}
          />
          {!!erros.descricao && <Text style={styles.erro}>{erros.descricao}</Text>}

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.grade}>
            {CATEGORIAS.map((cat) => {
              const ativa = cat === categoria;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  style={[styles.chip, ativa && styles.chipAtivo]}
                  onPress={() => escolherCategoria(cat)}
                >
                  <Text style={styles.chipIcone}>{ICONES[cat] ?? '📦'}</Text>
                  <Text style={[styles.chipTexto, ativa && styles.chipTextoAtivo]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!!erros.categoria && <Text style={styles.erro}>{erros.categoria}</Text>}

          {/* Bloco DATA */}
          <Text style={styles.label}>Data</Text>
          <SeletorData valor={data} onChange={escolherData} erro={erros.data} />
          {!!erros.data && <Text style={styles.erro}>{erros.data}</Text>}

          {/* Bloco FOTO */}
          <Text style={styles.label}>Foto do recibo (opcional)</Text>
          <FotoRecibo foto={foto} onChange={mudarFoto} onErro={setErroGeral} />

          {!!erroGeral && <Text style={[styles.erro, styles.erroGeral]}>{erroGeral}</Text>}
        </View>
      </ScrollView>

      {/* Rodapé fixo */}
      <View style={styles.rodape}>
        <TouchableOpacity
          style={[styles.botaoSecundario]}
          onPress={() => navigation.goBack()}
          disabled={salvando}
        >
          <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, salvando && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={salvando}
          activeOpacity={0.85}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Salvar gasto</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: fundo },
  scroll: { paddingBottom: 24 },

  hero: {
    backgroundColor: verde,
    paddingTop: 20,
    paddingBottom: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 8 },
  valorLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  moeda: { color: '#fff', fontSize: 28, fontWeight: '600', marginRight: 8 },
  valorInput: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
    minWidth: 140,
    textAlign: 'center',
    padding: 0,
    outlineStyle: 'none',
  },
  erroHero: { color: '#ffd7d7', fontSize: 13, marginTop: 8 },

  cartao: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#5b6b66', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: fundo,
    borderWidth: 1,
    borderColor: '#e1e6e4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: texto,
  },
  inputErro: { borderColor: vermelho },
  erro: { color: vermelho, fontSize: 13, marginTop: 6 },
  erroGeral: { marginTop: 16, textAlign: 'center' },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e1e6e4',
    backgroundColor: fundo,
  },
  chipAtivo: { backgroundColor: verde, borderColor: verde },
  chipIcone: { fontSize: 15, marginRight: 6 },
  chipTexto: { color: texto, fontSize: 14 },
  chipTextoAtivo: { color: '#fff', fontWeight: '700' },

  rodape: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8ecea',
  },
  botaoSecundario: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d5d3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSecundarioTexto: { color: texto, fontSize: 15, fontWeight: '600' },
  botao: {
    flex: 1,
    backgroundColor: verde,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});