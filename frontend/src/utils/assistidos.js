import { alertService } from "./alertService";

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
    alertService.show("Esse item já está marcado como assistido!", "erro");
    return false;
  }

  lista.push(itemData);
  localStorage.setItem(getChaveStorage(), JSON.stringify(lista));
  alertService.show("Marcado como assistido!", "sucesso");
  return true;
}

export async function desmarcarAssistido(id) {
  const confirmou = await alertService.confirm(
    "Remover esse item dos assistidos?",
  );
  if (!confirmou) return false;

  const lista = obterAssistidos();
  const novaLista = lista.filter((item) => item.id !== id);
  localStorage.setItem(getChaveStorage(), JSON.stringify(novaLista));
  alertService.show("Removido dos assistidos!", "info");
  return true;
}