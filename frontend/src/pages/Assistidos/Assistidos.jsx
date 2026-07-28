import React, { useState, useEffect } from "react";
import styles from "./Assistidos.module.css";
import Sidebar from "../../components/Sidebar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import SeriesCard from "../../components/SeriesCard.jsx";
import iconeLupa from "../../assets/icons/lupa.svg";
import { obterAssistidos, desmarcarAssistido } from "../../utils/assistidos";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Assistidos() {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  const [tipoConteudo, setTipoConteudo] = useState("movie");
  const [generos, setGeneros] = useState([]);
  const [generoSelecionado, setGeneroSelecionado] = useState("todos");

  useEffect(() => {
    setItens(obterAssistidos());
  }, []);

  // Busca os gêneros conforme o tipo
  useEffect(() => {
    async function buscarGeneros() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${tipoConteudo}/list?api_key=${API_KEY}&language=pt-BR`
        );

        const data = await response.json();

        setGeneros(data.genres || []);
      } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
      }
    }

    setGeneroSelecionado("todos");
    buscarGeneros();
  }, [tipoConteudo]);

  function removerAssistido(id) {
    desmarcarAssistido(id);
    setItens((prev) => prev.filter((item) => item.id !== id));
  }

  const itensFiltrados = itens.filter((item) => {
    const pesquisaOK = (item.title || "")
      .toLowerCase()
      .includes(busca.toLowerCase());

    const generoOK =
      generoSelecionado === "todos" ||
      (Array.isArray(item.genre_ids) &&
        item.genre_ids.includes(Number(generoSelecionado)));

    const tipoItem = item.tipo || "movie";

    const tipoOK =
      tipoConteudo === "movie"
        ? tipoItem === "movie"
        : tipoItem === "tv";

    return pesquisaOK && generoOK && tipoOK;
  });

  return (
    <>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.headerList}>
          <div>
            <h1>Assistidos</h1>
            <p>Filmes e séries que você já assistiu.</p>
          </div>

          <div className={styles.searchBar}>
            <img src={iconeLupa} alt="Pesquisar" />

            <input
              type="text"
              placeholder="Pesquisar filmes e séries..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </header>

        {/* Filmes / Séries */}
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

        {/* Gêneros */}
        <section className={styles.categoriesList}>
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
                generoSelecionado === String(genero.id)
                  ? styles.active
                  : ""
              }`}
              onClick={() => setGeneroSelecionado(String(genero.id))}
            >
              {genero.name}
            </span>
          ))}
        </section>

        <section className={styles.movieGrid}>
          {itensFiltrados.length > 0 ? (
            itensFiltrados.map((item) =>
              item.tipo === "tv" ? (
                <SeriesCard
                  key={item.id}
                  id={item.id}
                  titulo={item.title}
                  subtitulo={item.release_date}
                  poster={item.poster_path}
                  genre_ids={item.genre_ids}
                  tipo={item.tipo}
                  mostrarBotaoAdd={false}
                  mostrarBotaoRemover={true}
                  onRemover={removerAssistido}
                />
              ) : (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  titulo={item.title}
                  subtitulo={item.release_date}
                  poster={item.poster_path}
                  genre_ids={item.genre_ids}
                  tipo={item.tipo}
                  mostrarBotaoAdd={false}
                  mostrarBotaoRemover={true}
                  onRemover={removerAssistido}
                />
              )
            )
          ) : (
            <p className={styles.statusMsg}>
              {itens.length === 0
                ? "Você ainda não marcou nada como assistido."
                : "Nenhum resultado encontrado."}
            </p>
          )}
        </section>

        <footer className={styles.tmdbAttribution}>
          <p>
            Este produto usa a API do TMDB, mas não é endossado ou certificado
            pelo TMDB.
          </p>
        </footer>
      </main>
    </>
  );
}