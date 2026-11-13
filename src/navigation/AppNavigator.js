import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import DetalhesGastoScreen from '../screens/DetalhesGastoScreen';
import NovoGastoScreen from '../screens/NovoGastoScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

// Telas para usuário logado: Stack contendo as Tabs + telas extras
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="DetalhesGasto" component={DetalhesGastoScreen} options={{ title: 'Detalhes do gasto' }} />
      <Stack.Screen name="NovoGasto" component={NovoGastoScreen} options={{ title: 'Novo gasto' }} />
    </Stack.Navigator>
  );
}
