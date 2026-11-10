import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  titulo: { ...typography.title, color: colors.text },
});
