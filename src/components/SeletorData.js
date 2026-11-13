import { useState, createElement } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme';
import { formatarData } from '../utils/validacao';

// Date -> "AAAA-MM-DD" (formato que o <input type="date"> da web entende)
function paraInputWeb(d) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Seletor de data do gasto.
// - Celular: abre o calendário nativo (Android em janela, iOS embutido na tela).
// - Web: a biblioteca do calendário não funciona no navegador, então usamos
//   o <input type="date"> do próprio navegador.
// Não deixa escolher data no futuro (maximumDate = hoje).
export default function SeletorData({ valor, onChange, erro }) {
  const [aberto, setAberto] = useState(false);
  const hoje = new Date();

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.caixa, erro && styles.caixaErro]}>
        <Text style={styles.icone}>📅</Text>
        {createElement('input', {
          type: 'date',
          value: paraInputWeb(valor),
          max: paraInputWeb(hoje),
          onChange: (e) => {
            if (!e.target.value) return;
            const [ano, mes, dia] = e.target.value.split('-').map(Number);
            onChange(new Date(ano, mes - 1, dia, 12));
          },
          style: estiloInputWeb,
        })}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.caixa, erro && styles.caixaErro]}
        onPress={() => setAberto(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.icone}>📅</Text>
        <Text style={styles.texto}>{formatarData(valor)}</Text>
        <Text style={styles.alterar}>Alterar</Text>
      </TouchableOpacity>

      {aberto && (
        <DateTimePicker
          value={valor}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={hoje}
          locale="pt-BR"
          accentColor={colors.primary}
          onValueChange={(_evento, novaData) => {
            setAberto(false);
            onChange(novaData);
          }}
          onDismiss={() => setAberto(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#e1e6e4',
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  caixaErro: { borderColor: colors.error },
  icone: { fontSize: 16, marginRight: 10 },
  texto: { flex: 1, fontSize: 16, color: colors.text },
  alterar: { fontSize: 14, fontWeight: '700', color: colors.primary },
});

const estiloInputWeb = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 16,
  fontFamily: 'inherit',
  color: colors.text,
  paddingTop: 12,
  paddingBottom: 12,
};
