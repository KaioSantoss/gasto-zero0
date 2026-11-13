import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Cadastro com e-mail e senha (mínimo 6 caracteres)
export async function cadastrar(email, senha) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

// Login
export async function entrar(email, senha) {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

// Logout
export async function sair() {
  await signOut(auth);
}

// Usuário logado no momento (ou null)
export function usuarioAtual() {
  return auth.currentUser;
}

// Escuta mudanças de login/logout. Retorna a função para cancelar.
export function observarUsuario(callback) {
  return onAuthStateChanged(auth, callback);
}

// Traduz os códigos de erro do Firebase para mensagens em português
export function traduzirErroAuth(error) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
