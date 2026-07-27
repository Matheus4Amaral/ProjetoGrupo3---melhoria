import { useEffect, useState } from "react";
import { obterListaIds } from "../../utils/minhaLista";
import { obterAssistidosIds } from "../../utils/assistidos";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar.jsx";
import StatCard from "../../components/StatCard.jsx";
import MovieCard from "../../components/MovieCard.jsx";

import styles from "./Inicio.module.css";

import iconeLupa from "../../assets/icons/lupa.svg";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

export default function Inicio() {
  const [busca, setBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState([]);
  const [filmesPopulares, setFilmesPopulares] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [generoSelecionado, setGeneroSelecionado] = useState("todos");
  const [tipoConteudo, setTipoConteudo] = useState("movie");
  const usuarioNome = localStorage.getItem("usuarioNome") || "Usuário";

  // Começam em 0 — o valor real só chega depois que o useEffect
  // (lá embaixo) buscar do banco, já que agora é uma chamada assíncrona
  const [quantidadeQueroAssistir, setQuantidadeQueroAssistir] = useState(0);
  const [quantidadeAssistidos, setQuantidadeAssistidos] = useState(0);

  // Busca no banco (via API) quantos itens existem em cada lista, e
  // atualiza os dois contadores. Chamada tanto ao carregar a página
  // quanto sempre que o MovieCard adicionar/remover algo.
  async function atualizarContadores() {
    const [lista, assistidos] = await Promise.all([
      obterListaIds(),
      obterAssistidosIds(),
    ]);
    setQuantidadeQueroAssistir(lista.length);
    setQuantidadeAssistidos(assistidos.length);
  }

  // NOVO: dispara a busca dos contadores assim que a página monta.
  // Sem esse useEffect, os contadores ficariam parados em 0 pra sempre,
  // já que "atualizarContadores" só é chamada aqui e dentro dos MovieCard.
  useEffect(() => {
    atualizarContadores();
  }, []);

  const estatisticas = [
    {
      id: 1,
      valor: String(quantidadeAssistidos),
      legenda: "Assistidos",
      corTexto: "text-orange",
    },
    {
      id: 2,
      valor: String(quantidadeQueroAssistir),
      legenda: "Quero Assistir",
      corTexto: "text-cyan",
    },
  ];

  // Carrega os filmes/séries populares (ou filtrados por gênero).
  useEffect(() => {
    let ativo = true;

    async function carregarFilmes() {
      try {
        let url;

        if (generoSelecionado === "todos") {
          url = `https://api.themoviedb.org/3/${tipoConteudo}/popular?api_key=${API_KEY}&language=pt-BR`;
        } else {
          url = `https://api.themoviedb.org/3/discover/${tipoConteudo}?api_key=${API_KEY}&language=pt-BR&with_genres=${generoSelecionado}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        const itensNormalizados = (data.results || []).map((item) => ({
          id: item.id,
          titulo: tipoConteudo === "tv" ? item.name : item.title,
          dataLancamento:
            tipoConteudo === "tv" ? item.first_air_date : item.release_date,
          poster_path: item.poster_path,
          genre_ids: item.genre_ids,
        }));

        if (ativo) {
          setFilmesPopulares(itensNormalizados.slice(0, 6));
        }
      } catch (erro) {
        console.log(erro);
      }
    }

    carregarFilmes();

    return () => {
      ativo = false;
    };
  }, [generoSelecionado, tipoConteudo]);

  // Carrega os gêneros do tipo atual e reseta o filtro sempre que o
  // tipo (filme/série) muda.
  useEffect(() => {
    let ativo = true;

    async function carregarGeneros() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${tipoConteudo}/list?api_key=${API_KEY}&language=pt-BR`,
        );

        const data = await response.json();

        if (ativo) {
          setGeneros(data.genres || []);
        }
      } catch (erro) {
        console.error("Erro ao carregar gêneros:", erro);
      }
    }

    setGeneroSelecionado("todos");
    carregarGeneros();

    return () => {
      ativo = false;
    };
  }, [tipoConteudo]);

  // Pesquisa com debounce.
  useEffect(() => {
    if (busca.trim() === "") {
      setResultadoBusca([]);
      return;
    }

    let ativo = true;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/${tipoConteudo}?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(busca)}`,
        );

        const data = await response.json();

        const itensNormalizados = (data.results || []).map((item) => ({
          id: item.id,
          titulo: tipoConteudo === "tv" ? item.name : item.title,
          dataLancamento:
            tipoConteudo === "tv" ? item.first_air_date : item.release_date,
          poster_path: item.poster_path,
          genre_ids: item.genre_ids,
        }));

        if (ativo) {
          setResultadoBusca(itensNormalizados.slice(0, 6));
        }
      } catch (erro) {
        console.error("Erro na pesquisa:", erro);
      }
    }, 300);

    return () => {
      ativo = false;
      clearTimeout(timeout);
    };
  }, [busca, tipoConteudo]);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />

      <main className={styles.inicioContent}>
        <div className={styles.tipoToggle}>
          <span
            className={`${styles.categoryPill} ${
              tipoConteudo === "movie" ? styles.active : ""
            }`}
            onClick={() => setTipoConteudo("movie")}
          >
            Filmes
          </span>

          <span
            className={`${styles.categoryPill} ${
              tipoConteudo === "tv" ? styles.active : ""
            }`}
            onClick={() => setTipoConteudo("tv")}
          >
            Séries
          </span>
        </div>

        <header className={styles.inicioHeader}>
          <div className={styles.searchBar}>
            <img
              src={iconeLupa}
              alt="Pesquisar"
              style={{ width: "18px", height: "18px" }}
            />

            <input
              type="text"
              placeholder={
                tipoConteudo === "tv"
                  ? "Pesquisar séries..."
                  : "Pesquisar filmes..."
              }
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </header>

        {resultadoBusca.length > 0 && (
          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h3>Resultados da Pesquisa</h3>
            </div>

            <div className={styles.moviesGrid}>
              {resultadoBusca.map((filme) => (
                <MovieCard
                  key={filme.id}
                  id={filme.id}
                  titulo={filme.titulo}
                  subtitulo={
                    filme.dataLancamento ? filme.dataLancamento.slice(0, 4) : ""
                  }
                  poster={
                    filme.poster_path ? `${IMG_BASE}${filme.poster_path}` : null
                  }
                  genre_ids={filme.genre_ids}
                  mostrarBotaoAdd={true}
                  tipo={tipoConteudo}
                  aoAtualizarLista={atualizarContadores}
                />
              ))}
            </div>
          </section>
        )}

        <section className={styles.welcomeSection}>
          <span className={styles.userName}>{usuarioNome}</span>

          <p>O que você quer organizar hoje?</p>

          <div className={styles.statsGrid}>
            {estatisticas.map((stat) => (
              <StatCard
                key={stat.id}
                valor={stat.valor}
                legenda={stat.legenda}
                corTexto={stat.corTexto}
              />
            ))}
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h3>Populares no Catálogo</h3>

            <Link to="/Catalogo" className={styles.linkCyan}>
              Ver tudo
            </Link>
          </div>

          <div className={styles.moviesGrid}>
            {filmesPopulares.map((filme) => (
              <MovieCard
                key={filme.id}
                id={filme.id}
                titulo={filme.titulo}
                subtitulo={
                  filme.dataLancamento ? filme.dataLancamento.slice(0, 4) : ""
                }
                poster={
                  filme.poster_path ? `${IMG_BASE}${filme.poster_path}` : null
                }
                genre_ids={filme.genre_ids}
                mostrarBotaoAdd={true}
                tipo={tipoConteudo}
                aoAtualizarLista={atualizarContadores}
              />
            ))}
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h3>Explorar por Categoria</h3>

            <Link to="/Catalogo" className={styles.linkCyan}>
              Ver catálogo
            </Link>
          </div>

          <div className={styles.categoriesList}>
            <span
              className={`${styles.categoryPill} ${
                generoSelecionado === "todos" ? styles.active : ""
              }`}
              onClick={() => setGeneroSelecionado("todos")}
            >
              Todos
            </span>

            {generos.map((genero) => (
              <span
                key={genero.id}
                className={`${styles.categoryPill} ${
                  generoSelecionado === String(genero.id) ? styles.active : ""
                }`}
                onClick={() => setGeneroSelecionado(String(genero.id))}
              >
                {genero.name}
              </span>
            ))}
          </div>
        </section>

        <footer className={styles.tmdbAttribution}>
          <p>
            Este produto usa a API do TMDB, mas não é endossado ou certificado
            pelo TMDB.
          </p>
        </footer>
      </main>
    </div>
  );
}
