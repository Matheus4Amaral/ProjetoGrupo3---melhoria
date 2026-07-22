function getChaveStorage() {
  const usuarioId = localStorage.getItem("usuarioId");
  return usuarioId ? `assistidos_${usuarioId}` : "assistidos_convidado";
}

export function obterAssistidos() {
  return JSON.parse(localStorage.getItem(getChaveStorage())) || [];
}

export function estaAssistido(id) {
  const lista = obterAssistidos();
  return lista.some((item) => item.id === id);
}

export function marcarComoAssistido(itemData) {
  const lista = obterAssistidos();
  const jaExiste = lista.some((item) => item.id === itemData.id);

  if (jaExiste) {
    return false;
  }

  lista.push(itemData);
  localStorage.setItem(getChaveStorage(), JSON.stringify(lista));
  return true;
}

export function desmarcarAssistido(id) {
  const lista = obterAssistidos();
  const novaLista = lista.filter((item) => item.id !== id);
  localStorage.setItem(getChaveStorage(), JSON.stringify(novaLista));
}