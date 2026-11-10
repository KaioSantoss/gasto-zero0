import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

export default function Navigation() {
  // TODO (Pessoa 3): trocar por const { user, carregando } = useAuth();
  const user = true; // true = mostra o app | false = mostra o Login

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
