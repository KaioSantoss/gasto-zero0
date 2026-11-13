import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { observarUsuario, entrar, cadastrar, sair } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true até o Firebase informar se existe sessão salva
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = observarUsuario((usuario) => {
      setUser(usuario);
      setCarregando(false);
    });
    return cancelar;
  }, []);

  // Os erros são repassados para a tela, que usa traduzirErroAuth(error)
  const login = useCallback((email, senha) => entrar(email.trim(), senha), []);
  const registrar = useCallback((email, senha) => cadastrar(email.trim(), senha), []);
  const logout = useCallback(() => sair(), []);

  const value = useMemo(
    () => ({ user, carregando, login, registrar, logout }),
    [user, carregando, login, registrar, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
