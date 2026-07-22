import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import "./DetalhesFilme.css";

import BannerFilme from "../../components/BannerFilme";
import PosterFilme from "../../components/PosterFilme";
import InformacoesFilme from "../../components/InformacoesFilme";
import SinopseFilme from "../../components/SinopseFilme";
import { adicionarNaLista, estaNaLista } from "../../utils/minhaLista";
import { removerDaLista } from "../../utils/minhaLista";
import { marcarComoAssistido, desmarcarAssistido, estaAssistido } from "../../utils/assistidos";
import ComentariosFilme from "../../components/ComentariosFilme";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

function DetalhesFilme() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [naLista, setNaLista] = useState(false);
  const [assistido, setAssistido] = useState(false);

  useEffect(() => {
    async function carregarFilme() {
      try {
        setCarregando(true);

        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`,
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar filme.");
        }

        const data = await response.json();

        setFilme(data);
        setNaLista(estaNaLista(data.id));
        setAssistido(estaAssistido(data.id));
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarFilme();
  }, [id]);

  function handleToggleMinhaLista() {
    if (naLista) {
      removerDaLista(filme.id);
      setNaLista(false);
    } else {
      adicionarNaLista({
        id: filme.id,
        title: filme.title,
        poster_path: filme.poster_path
          ? `${IMG_BASE}${filme.poster_path}`
          : null,
        release_date: filme.release_date,
        genre_ids: filme.genres ? filme.genres.map((g) => g.id) : [],
      });
      setNaLista(true);
    }
  }

function handleToggleAssistido() {
    if (assistido) {
      desmarcarAssistido(filme.id);
      setAssistido(false);
    } else {
      marcarComoAssistido({
        id: filme.id,
        title: filme.title,
        poster_path: filme.poster_path
          ? `${IMG_BASE}${filme.poster_path}`
          : null,
        release_date: filme.release_date,
        genre_ids: filme.genres ? filme.genres.map((g) => g.id) : [],
        tipo: "movie",
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
      <BannerFilme backdrop={filme.backdrop_path} />

      <div className="detalhes-container">
        <PosterFilme poster={filme.poster_path} titulo={filme.title} />

        <InformacoesFilme filme={filme} />
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

      <SinopseFilme overview={filme.overview} />
      <ComentariosFilme filmeId={filme.id} />
    </main>
  );
}

export default DetalhesFilme;