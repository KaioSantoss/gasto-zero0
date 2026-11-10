import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export default function ResumoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  titulo: { ...typography.title, color: colors.text },
});
