import { View, Text, Button, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function GastosScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gastos</Text>
      <Button title="Novo gasto" onPress={() => navigation.navigate('NovoGasto')} />
      <Button title="Ver detalhes" onPress={() => navigation.navigate('DetalhesGasto', { id: 'teste' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
  titulo: { ...typography.title, color: colors.text },
});
