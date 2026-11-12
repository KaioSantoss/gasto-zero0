// Cada validador devolve uma mensagem de erro (string) ou null quando está ok.

export function validarEmail(texto) {
  const email = (texto ?? '').trim();
  if (!email) return 'Informe o e-mail.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail inválido.';
  return null;
}

export function validarSenha(texto) {
  if (!texto) return 'Informe a senha.';
  if (texto.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  return null;
}

export function validarDescricao(texto) {
  const d = (texto ?? '').trim();
  if (!d) return 'Informe a descrição.';
  if (d.length < 3) return 'A descrição precisa ter pelo menos 3 caracteres.';
  if (d.length > 60) return 'A descrição pode ter no máximo 60 caracteres.';
  return null;
}

// Aceita "12,50" ou "12.50"
export function converterValor(texto) {
  return Number(String(texto ?? '').trim().replace(',', '.'));
}

export function validarValor(texto) {
  if (!String(texto ?? '').trim()) return 'Informe o valor.';
  const n = converterValor(texto);
  if (Number.isNaN(n)) return 'Digite apenas números (ex.: 25,90).';
  if (n <= 0) return 'O valor precisa ser maior que zero.';
  if (n > 1000000) return 'Valor muito alto.';
  return null;
}

export function validarCategoria(texto) {
  return texto ? null : 'Escolha uma categoria.';
}

// Data no formato DD/MM/AAAA
export function validarData(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((texto ?? '').trim());
  if (!m) return 'Use o formato DD/MM/AAAA.';
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(ano, mes - 1, dia);
  const existe = d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
  return existe ? null : 'Data inexistente.';
}

export function formatarData(data) {
  const d = data instanceof Date && !Number.isNaN(data.getTime()) ? data : new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

// "DD/MM/AAAA" -> string ISO (ao meio-dia, para o fuso não mudar o dia)
export function dataParaISO(texto) {
  const [dia, mes, ano] = texto.trim().split('/').map(Number);
  return new Date(ano, mes - 1, dia, 12).toISOString();
}

// Valida o formulário de gasto inteiro. Devolve { campo: mensagem } só com os campos inválidos.
export function validarGasto(valores) {
  const erros = {
    descricao: validarDescricao(valores.descricao),
    valor: validarValor(valores.valor),
    categoria: validarCategoria(valores.categoria),
    data: validarData(valores.data),
  };
  Object.keys(erros).forEach((k) => erros[k] === null && delete erros[k]);
  return erros;
}
