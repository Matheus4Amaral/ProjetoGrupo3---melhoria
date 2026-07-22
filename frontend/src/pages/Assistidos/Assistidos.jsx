import React, { useState, useEffect } from "react";
import styles from "./Assistidos.module.css";
import Sidebar from "../../components/Sidebar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import iconeLupa from "../../assets/icons/lupa.svg";
import { obterAssistidos, desmarcarAssistido } from "../../utils/assistidos";

export default function Assistidos() {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setItens(obterAssistidos());
  }, []);

  function removerAssistido(id) {
    desmarcarAssistido(id);
    setItens((prev) => prev.filter((item) => item.id !== id));
  }

  const itensFiltrados = itens.filter((item) =>
    item.title.toLowerCase().includes(busca.toLowerCase())
  );

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

        <section className={styles.movieGrid}>
          {itensFiltrados.length > 0 ? (
            itensFiltrados.map((item) => (
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
            ))
          ) : (
            <p className={styles.statusMsg}>
              {itens.length === 0
                ? "Você ainda não marcou nada como assistido."
                : "Nenhum resultado encontrado."}
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