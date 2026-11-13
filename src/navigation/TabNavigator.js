import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import GastosScreen from '../screens/GastosScreen';
import ResumoScreen from '../screens/ResumoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONES = {
  Gastos: ['wallet', 'wallet-outline'],
  Resumo: ['pie-chart', 'pie-chart-outline'],
  Perfil: ['person', 'person-outline'],
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={ICONES[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Gastos" component={GastosScreen} options={{ title: 'Meus gastos' }} />
      <Tab.Screen name="Resumo" component={ResumoScreen} options={{ title: 'Resumo do mês' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
