const API_URL = "http://localhost:3000";
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

function getUsuarioId() {
  return localStorage.getItem("usuarioId");
}

export async function obterAssistidosIds() {
  const usuarioId = getUsuarioId();
  if (!usuarioId) return [];

  const response = await fetch(
    `${API_URL}/interacoes/assistidos/${usuarioId}`,
    {
      cache: "no-store",
    },
  );
  return response.json();
}

export async function obterAssistidos() {
  const referencias = await obterAssistidosIds();

  const detalhes = await Promise.all(
    referencias.map(async ({ filme_id, tipo }) => {
      const endpoint = tipo === "tv" ? "tv" : "movie";
      const resp = await fetch(
        `https://api.themoviedb.org/3/${endpoint}/${filme_id}?api_key=${TMDB_KEY}&language=pt-BR`,
      );
      const data = await resp.json();

      return {
        id: data.id,
        title: tipo === "tv" ? data.name : data.title,
        poster_path: data.poster_path ? `${IMG_BASE}${data.poster_path}` : null,
        release_date: tipo === "tv" ? data.first_air_date : data.release_date,
        genre_ids: data.genres ? data.genres.map((g) => g.id) : [],
        tipo,
      };
    }),
  );

  return detalhes;
}

export async function estaAssistido(id, tipo = "movie") {
  const usuarioId = getUsuarioId();
  if (!usuarioId) return false;

  const response = await fetch(
    `${API_URL}/interacoes/status/${usuarioId}/${id}/${tipo}`,
    { cache: "no-store" },
  );
  const data = await response.json();
  return data.assistido;
}

export async function marcarComoAssistido(itemData) {
  const usuarioId = getUsuarioId();
  if (!usuarioId) {
    return { sucesso: false, mensagem: "Você precisa estar logado." };
  }

  const response = await fetch(`${API_URL}/interacoes/assistido/adicionar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuarioId,
      filmeId: itemData.id,
      tipo: itemData.tipo || "movie",
    }),
  });

  if (!response.ok) {
    return { sucesso: false, mensagem: "Erro ao marcar como assistido." };
  }

  return { sucesso: true, mensagem: "Marcado como assistido!" };
}

export async function desmarcarAssistido(id, tipo = "movie") {
  const usuarioId = getUsuarioId();
  if (!usuarioId) return;

  await fetch(`${API_URL}/interacoes/assistido/remover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId, filmeId: id, tipo }),
  });
}
