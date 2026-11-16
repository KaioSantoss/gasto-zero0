import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { colors } from '../theme';

// Reduz a foto para 800px de largura e comprime em JPEG.
// O resultado é uma "data URI" (texto base64) que cabe dentro do documento
// do Firestore (limite de 1 MB), sem precisar do Firebase Storage.
async function comprimirFoto(uri) {
  const contexto = ImageManipulator.manipulate(uri).resize({ width: 800 });
  const imagem = await contexto.renderAsync();
  const resultado = await imagem.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.5,
    base64: true,
  });
  return `data:image/jpeg;base64,${resultado.base64}`;
}

// Pede permissão para câmera ou galeria. Na web o navegador cuida disso sozinho.
async function pedirPermissao(origem) {
  if (Platform.OS === 'web') return true;
  const resposta =
    origem === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  return resposta.granted;
}

// Foto do recibo: tirar com a câmera ou escolher da galeria.
// Props:
//   foto      -> data URI da foto atual (ou null)
//   onChange  -> recebe a nova foto (ou null quando o usuário remove)
//   onErro    -> recebe uma mensagem de erro para mostrar na tela
export default function FotoRecibo({ foto, onChange, onErro }) {
  const [processando, setProcessando] = useState(false);

  async function escolher(origem) {
    try {
      const permitido = await pedirPermissao(origem);
      if (!permitido) {
        onErro(
          origem === 'camera'
            ? 'Permita o acesso à câmera nas configurações do celular.'
            : 'Permita o acesso às fotos nas configurações do celular.'
        );
        return;
      }

      const opcoes = { mediaTypes: ['images'], allowsEditing: true, quality: 1 };
      const resultado =
        origem === 'camera'
          ? await ImagePicker.launchCameraAsync(opcoes)
          : await ImagePicker.launchImageLibraryAsync(opcoes);

      if (resultado.canceled) return;

      setProcessando(true);
      const novaFoto = await comprimirFoto(resultado.assets[0].uri);
      onChange(novaFoto);
    } catch (e) {
      console.log('Erro na foto:', e);
      onErro('Não foi possível carregar a foto.');
    } finally {
      setProcessando(false);
    }
  }

  if (processando) {
    return (
      <View style={[styles.vazio, styles.centro]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.dica}>Preparando a foto...</Text>
      </View>
    );
  }

  if (foto) {
    return (
      <View>
        <Image source={{ uri: foto }} style={styles.preview} resizeMode="cover" />
        <View style={styles.linhaBotoes}>
          <TouchableOpacity style={styles.botao} onPress={() => escolher('galeria')}>
            <Text style={styles.botaoTexto}>Trocar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.botaoRemover]}
            onPress={() => onChange(null)}
          >
            <Text style={[styles.botaoTexto, styles.botaoRemoverTexto]}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.linhaBotoes}>
      <TouchableOpacity style={styles.botao} onPress={() => escolher('camera')}>
        <Text style={styles.botaoIcone}>📷</Text>
        <Text style={styles.botaoTexto}>Câmera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botao} onPress={() => escolher('galeria')}>
        <Text style={styles.botaoIcone}>🖼️</Text>
        <Text style={styles.botaoTexto}>Galeria</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  linhaBotoes: { flexDirection: 'row', gap: 10 },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  botaoIcone: { fontSize: 16 },
  botaoTexto: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  botaoRemover: { borderColor: colors.error, backgroundColor: '#fff' },
  botaoRemoverTexto: { color: colors.error },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginBottom: 10,
  },
  vazio: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  centro: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  dica: { fontSize: 13, color: colors.textLight },
});
