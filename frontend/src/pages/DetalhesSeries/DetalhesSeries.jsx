import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import "../DetalhesFilme/DetalhesFilme.css";

import BannerFilme from "../../components/BannerFilme";
import PosterFilme from "../../components/PosterFilme";
import InformacoesFilme from "../../components/InformacoesFilme";
import SinopseFilme from "../../components/SinopseFilme";
import {
  adicionarNaLista,
  estaNaLista,
  removerDaLista,
} from "../../utils/minhaLista";
import {
  marcarComoAssistido,
  desmarcarAssistido,
  estaAssistido,
} from "../../utils/assistidos";
import ComentariosFilme from "../../components/ComentariosFilme";
import TemporadasSerie from "../../components/TemporadasSerie";
import { useToast } from "../../components/ToastContext.jsx";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

function DetalhesSeries() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mostrarToast = useToast();

  const [serie, setSerie] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [naLista, setNaLista] = useState(false);
  const [assistido, setAssistido] = useState(false);

  useEffect(() => {
    async function carregarSerie() {
      try {
        setCarregando(true);

        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`,
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar série.");
        }

        const data = await response.json();

        const serieNormalizada = {
          ...data,
          title: data.name,
          release_date: data.first_air_date,
          runtime: data.episode_run_time?.[0] ?? null,
        };

        setSerie(serieNormalizada);
        setNaLista(await estaNaLista(data.id, "tv"));
        setAssistido(await estaAssistido(data.id, "tv"));
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarSerie();
  }, [id]);

  async function handleToggleMinhaLista() {
    if (naLista) {
      await removerDaLista(serie.id, "tv"); // <- adiciona "tv" aqui
      setNaLista(false);
      mostrarToast("Série removida da sua lista", "sucesso");
    } else {
      await adicionarNaLista({
        id: serie.id,
        title: serie.title,
        poster_path: serie.poster_path
          ? `${IMG_BASE}${serie.poster_path}`
          : null,
        release_date: serie.release_date,
        genre_ids: serie.genres ? serie.genres.map((g) => g.id) : [],
        tipo: "tv",
      });
      setNaLista(true);
      mostrarToast("Série adicionada!", "sucesso");
    }
  }

  async function handleToggleAssistido() {
    if (assistido) {
      await desmarcarAssistido(serie.id, "tv");
      setAssistido(false);
      mostrarToast("Série removida dos assistidos", "sucesso");
    } else {
      await marcarComoAssistido({
        id: serie.id,
        title: serie.title,
        poster_path: serie.poster_path
          ? `${IMG_BASE}${serie.poster_path}`
          : null,
        release_date: serie.release_date,
        genre_ids: serie.genres ? serie.genres.map((g) => g.id) : [],
        tipo: "tv",
      });
      setAssistido(true);
      mostrarToast("Série marcada como assistida!", "sucesso");
    }
  }

  if (carregando) {
    return <h2>Carregando...</h2>;
  }

  if (erro) {
    return <h2>{erro}</h2>;
  }

  return (
    <main className="detalhes-page">
      <BannerFilme backdrop={serie.backdrop_path} />

      <div className="detalhes-container">
        <PosterFilme poster={serie.poster_path} titulo={serie.title} />

        <InformacoesFilme filme={serie} />
      </div>
      <div className="btn-detail">
        <Link to="/Catalogo" className="btn-voltar ">
          Voltar
        </Link>

        <button
          className={naLista ? "btn-na-lista" : "btn-adicionar-lista"}
          onClick={handleToggleMinhaLista}
        >
          {naLista
            ? "✓ Na sua Lista (clique para remover)"
            : "+ Adicionar à Minha Lista"}
        </button>

        <button
          className={assistido ? "btn-na-lista" : "btn-assistido"}
          onClick={handleToggleAssistido}
        >
          {assistido
            ? "✓ Assistido (clique para remover)"
            : "Marcar como Assistido"}
        </button>
      </div>

      <SinopseFilme overview={serie.overview} />

      <TemporadasSerie serieId={serie.id} temporadas={serie.seasons} />

      <ComentariosFilme filmeId={serie.id} />
    </main>
  );
}

export default DetalhesSeries;
