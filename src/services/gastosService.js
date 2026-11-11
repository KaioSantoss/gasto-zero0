import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Coleção: gastos
// Campos: descricao (string), valor (number), categoria (string),
//         data (string ISO ou timestamp), userId (string), criadoEm (timestamp)
const gastosRef = collection(db, 'gastos');

// CREATE
export async function criarGasto(gasto) {
  const ref = await addDoc(gastosRef, {
    ...gasto,
    criadoEm: serverTimestamp(),
  });
  return ref.id;
}

// READ (lista). Se passar userId, traz só os gastos daquele usuário.
export async function listarGastos(userId) {
  const q = userId ? query(gastosRef, where('userId', '==', userId)) : gastosRef;
  const snap = await getDocs(q);
  const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Mais recentes primeiro (ordenado no app para não exigir índice)
  return lista.sort((a, b) => {
    const ta = a.criadoEm?.seconds ?? 0;
    const tb = b.criadoEm?.seconds ?? 0;
    return tb - ta;
  });
}

// READ (um gasto só)
export async function buscarGasto(id) {
  const snap = await getDoc(doc(db, 'gastos', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// UPDATE
export async function editarGasto(id, dados) {
  await updateDoc(doc(db, 'gastos', id), dados);
}

// DELETE
export async function removerGasto(id) {
  await deleteDoc(doc(db, 'gastos', id));
}
