import { useEffect, useState } from "react";
import { obterLista } from "../../utils/minhaLista";
import { obterAssistidos } from "../../utils/assistidos";
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
  const usuarioNome = localStorage.getItem("usuarioNome") || "Usuário";
  const quantidadeQueroAssistir = obterLista().length;
  const quantidadeAssistidos = obterAssistidos().length;
  const [tipoConteudo, setTipoConteudo] = useState("movie");

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
  // A flag "ativo" evita que uma resposta desatualizada (ex: de um
  // gênero que não existe mais no tipo atual) sobrescreva um
  // resultado mais recente.
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
  // tipo (filme/série) muda, já que os IDs de gênero são diferentes.
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

    setGeneroSelecionado("todos"); // reseta o filtro ao trocar de tipo
    carregarGeneros();

    return () => {
      ativo = false;
    };
  }, [tipoConteudo]);

  // Pesquisa com debounce, refeita automaticamente se o tipo mudar
  // enquanto já existe um termo de busca digitado.
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
        {/* Mudar tipo (movie/tv) */}
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

        {/* PESQUISA */}
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

        {/* RESULTADOS DA BUSCA */}
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
                    filme.dataLancamento
                      ? filme.dataLancamento.slice(0, 4)
                      : ""
                  }
                  poster={
                    filme.poster_path
                      ? `${IMG_BASE}${filme.poster_path}`
                      : null
                  }
                  genre_ids={filme.genre_ids}
                  mostrarBotaoAdd={true}
                  tipo={tipoConteudo}
                />
              ))}
            </div>
          </section>
        )}

        {/* BOAS-VINDAS */}
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

        {/* POPULARES */}
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
              />
            ))}
          </div>
        </section>

        {/* CATEGORIAS */}
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