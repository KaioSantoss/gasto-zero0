import * as Haptics from 'expo-haptics';

// Feedback háptico (vibração curta) do app.
// Cada função ignora erros: se o aparelho não tiver motor de vibração
// (ou estiver na web), o app continua funcionando normalmente.

// Toque leve ao escolher uma opção (categoria, data)
export function vibrarSelecao() {
  Haptics.selectionAsync().catch(() => {});
}

// Batida leve ao anexar ou remover a foto
export function vibrarLeve() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

// Vibração de sucesso ao salvar o gasto
export function vibrarSucesso() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

// Vibração de erro quando a validação falha ou o salvamento dá errado
export function vibrarErro() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
