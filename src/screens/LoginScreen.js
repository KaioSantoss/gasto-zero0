import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import { validarEmail, validarSenha } from '../utils/validacao';

const verde = colors.primary ?? '#115e4b';
const fundo = colors.background ?? '#f5f7f6';
const texto = colors.text ?? '#1b2a26';
const vermelho = '#c62828';

function mensagemErro(e) {
  // Usa o tradutor do projeto, se existir
  if (typeof authService.traduzirErroAuth === 'function') {
    return authService.traduzirErroAuth(e);
  }
  const mapa = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'Senha muito fraca.',
    'auth/operation-not-allowed': 'Login por e-mail/senha não está ativado no Firebase.',
    'auth/network-request-failed': 'Sem conexão. Verifique a internet.',
  };
  return mapa[e?.code] ?? `Erro: ${e?.code ?? e?.message ?? 'desconhecido'}`;
}

export default function LoginScreen() {
  const { login, registrar } = useAuth();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    setErroGeral('');
    const novosErros = {};
    const e1 = validarEmail(email);
    const e2 = validarSenha(senha);
    if (e1) novosErros.email = e1;
    if (e2) novosErros.senha = e2;
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setCarregando(true);
    try {
      if (modoCadastro) {
        await registrar(email, senha);
      } else {
        await login(email, senha);
      }
      // Ao logar, o Navigation troca para as abas sozinho
    } catch (e) {
      setErroGeral(mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topo}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.titulo}>Gasto Zero</Text>
        <Text style={styles.subtitulo}>
          {modoCadastro ? 'Crie sua conta' : 'Conecte-se para continuar'}
        </Text>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, erros.email && styles.inputErro]}
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          placeholderTextColor="#9aa5a1"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {!!erros.email && <Text style={styles.erro}>{erros.email}</Text>}

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={[styles.input, erros.senha && styles.inputErro]}
          value={senha}
          onChangeText={setSenha}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#9aa5a1"
          secureTextEntry
          autoCapitalize="none"
          onSubmitEditing={enviar}
        />
        {!!erros.senha && <Text style={styles.erro}>{erros.senha}</Text>}

        {!!erroGeral && <Text style={[styles.erro, styles.erroGeral]}>{erroGeral}</Text>}

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDesabilitado]}
          onPress={enviar}
          disabled={carregando}
          activeOpacity={0.85}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>{modoCadastro ? 'Criar conta' : 'Entrar'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setModoCadastro(!modoCadastro);
            setErros({});
            setErroGeral('');
          }}
          disabled={carregando}
          style={styles.alternar}
        >
          <Text style={styles.alternarTexto}>
            {modoCadastro ? 'Já tenho conta. Entrar' : 'Não tenho conta. Cadastrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: fundo, justifyContent: 'center', padding: 20 },
  topo: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 44 },
  titulo: { fontSize: 28, fontWeight: '800', color: verde, marginTop: 4 },
  subtitulo: { fontSize: 15, color: '#5b6b66', marginTop: 4 },

  cartao: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5b6b66',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  erroGeral: { marginTop: 14, textAlign: 'center' },

  botao: {
    backgroundColor: verde,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },

  alternar: { marginTop: 16, alignItems: 'center' },
  alternarTexto: { color: verde, fontSize: 14, fontWeight: '600' },
});