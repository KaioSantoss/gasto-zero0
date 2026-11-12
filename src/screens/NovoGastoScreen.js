import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { CATEGORIAS } from '../constants/categorias'; // AJUSTAR se o arquivo tiver outro nome
import { useAuth } from '../context/AuthContext'; // AJUSTAR se o hook tiver outro nome
import { criarGasto } from '../services/gastosService'; // AJUSTAR se o arquivo tiver outro nome
import {
  validarGasto,
  converterValor,
  formatarData,
  dataParaISO,
} from '../utils/validacao';

export default function NovoGastoScreen() {
  const navigation = useNavigation();
  const { user } = useAuth(); // AJUSTAR se o contexto expuser o usuário de outra forma

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(formatarData(new Date()));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErroGeral('');
    const valores = { descricao, valor, categoria, data };
    const errosEncontrados = validarGasto(valores);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setSalvando(true);
    try {
      await criarGasto({
        descricao: descricao.trim(),
        valor: converterValor(valor),
        categoria,
        data: dataParaISO(data),
        userId: user.uid,
      });
      navigation.goBack();
    } catch (e) {
      setErroGeral('Não foi possível salvar o gasto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, erros.descricao && styles.inputErro]}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: Almoço"
        maxLength={60}
      />
      {!!erros.descricao && <Text style={styles.erro}>{erros.descricao}</Text>}

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={[styles.input, erros.valor && styles.inputErro]}
        value={valor}
        onChangeText={setValor}
        placeholder="25,90"
        keyboardType="decimal-pad"
      />
      {!!erros.valor && <Text style={styles.erro}>{erros.valor}</Text>}

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        {CATEGORIAS.map((cat) => {
          const ativa = cat === categoria;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, ativa && styles.chipAtivo]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.chipTexto, ativa && styles.chipTextoAtivo]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!!erros.categoria && <Text style={styles.erro}>{erros.categoria}</Text>}

      <Text style={styles.label}>Data</Text>
      <TextInput
        style={[styles.input, erros.data && styles.inputErro]}
        value={data}
        onChangeText={setData}
        placeholder="DD/MM/AAAA"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      {!!erros.data && <Text style={styles.erro}>{erros.data}</Text>}

      {!!erroGeral && <Text style={styles.erro}>{erroGeral}</Text>}

      <TouchableOpacity
        style={[styles.botao, salvando && styles.botaoDesabilitado]}
        onPress={salvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>Salvar gasto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const verde = colors.primary ?? '#115e4b';

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d5d3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  inputErro: { borderColor: '#c62828' },
  erro: { color: '#c62828', fontSize: 13, marginTop: 4 },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d5d3',
    backgroundColor: '#fff',
  },
  chipAtivo: { backgroundColor: verde, borderColor: verde },
  chipTexto: { color: colors.text, fontSize: 14 },
  chipTextoAtivo: { color: '#fff', fontWeight: '600' },
  botao: {
    backgroundColor: verde,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});