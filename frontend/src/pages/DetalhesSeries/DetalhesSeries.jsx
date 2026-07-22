import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import "../DetalhesFilme/DetalhesFilme.css";

import BannerFilme from "../../components/BannerFilme";
import PosterFilme from "../../components/PosterFilme";
import InformacoesFilme from "../../components/InformacoesFilme";
import SinopseFilme from "../../components/SinopseFilme";
import { adicionarNaLista, estaNaLista, removerDaLista } from "../../utils/minhaLista";
import { marcarComoAssistido, desmarcarAssistido, estaAssistido } from "../../utils/assistidos";
import ComentariosFilme from "../../components/ComentariosFilme";
import TemporadasSerie from "../../components/TemporadasSerie";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

function DetalhesSeries() {
  const { id } = useParams();
  const navigate = useNavigate();

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
        setNaLista(estaNaLista(data.id));
        setAssistido(estaAssistido(data.id));
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarSerie();
  }, [id]);

  function handleToggleMinhaLista() {
    if (naLista) {
      removerDaLista(serie.id);
      setNaLista(false);
    } else {
      adicionarNaLista({
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
    }
  }

  function handleToggleAssistido() {
    if (assistido) {
      desmarcarAssistido(serie.id);
      setAssistido(false);
    } else {
      marcarComoAssistido({
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
          {assistido ? "✓ Assistido (clique para remover)" : "Marcar como Assistido"}
        </button>
      </div>

        <SinopseFilme overview={serie.overview} />

        <TemporadasSerie serieId={serie.id} temporadas={serie.seasons} />

        <ComentariosFilme filmeId={serie.id} />
    </main>
  );
}

export default DetalhesSeries;