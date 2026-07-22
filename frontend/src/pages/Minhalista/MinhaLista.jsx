import React, { useState, useEffect } from "react";
import styles from "./MinhaLista.module.css";
import Sidebar from "../../components/Sidebar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import iconeLupa from "../../assets/icons/lupa.svg";
import { obterLista, removerDaLista } from "../../utils/minhaLista";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function MinhaLista() {
  const [filmes, setFilmes] = useState([]);
  const [busca, setBusca] = useState("");
  const [generos, setGeneros] = useState([]);
  const [generoSelecionado, setGeneroSelecionado] = useState("todos");

  // Carrega filmes salvos (da lista do usuário logado)
  useEffect(() => {
    setFilmes(obterLista());
  }, []);

  // Busca gêneros do TMDB
  useEffect(() => {
    async function buscarGeneros() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=pt-BR`,
        );

        const data = await response.json();

        setGeneros(data.genres || []);
      } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
      }
    }

    buscarGeneros();
  }, []);

  // Remove filme da lista
  function removerFilme(id) {
    removerDaLista(id);
    setFilmes((prev) => prev.filter((filme) => filme.id !== id));
  }

  // Pesquisa + filtro gênero
  const filmesFiltrados = filmes.filter((filme) => {
    const pesquisaOK = filme.title.toLowerCase().includes(busca.toLowerCase());

    const generoOK =
      generoSelecionado === "todos" ||
      (Array.isArray(filme.genre_ids) &&
        filme.genre_ids.includes(Number(generoSelecionado)));

    return pesquisaOK && generoOK;
  });

  return (
    <>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.headerList}>
          <div>
            <h1>Minha Lista</h1>
            <p>Filmes e séries que você adicionou para assistir depois.</p>
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
                generoSelecionado === String(genero.id) ? styles.active : ""
              }`}
              onClick={() => setGeneroSelecionado(String(genero.id))}
            >
              {genero.name}
            </span>
          ))}
        </section>

        <section className={styles.movieGrid}>
          {filmesFiltrados.length > 0 ? (
            filmesFiltrados.map((filme) => (
              <MovieCard
                key={filme.id}
                id={filme.id}
                titulo={filme.title}
                subtitulo={filme.release_date}
                poster={filme.poster_path}
                genre_ids={filme.genre_ids}
                mostrarBotaoAdd={false}
                mostrarBotaoRemover={true}
                onRemover={removerFilme}
              />
            ))
          ) : (
            <p className={styles.statusMsg}>
              {filmes.length === 0
                ? "Sua lista está vazia."
                : "Nenhum filme encontrado."}
            </p>
          )}
        </section>
        <footer className={styles.tmdbAttribution}>
          <p>Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.</p>
        </footer>
      </main>
    </>
  );
}
