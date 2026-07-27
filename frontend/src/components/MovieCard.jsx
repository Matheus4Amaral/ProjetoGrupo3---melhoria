import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MovieCard.module.css";
import { adicionarNaLista } from "../utils/minhaLista";
import FeedbackModal from "./FeedbackModal";

export default function MovieCard({
  id,
  titulo,
  mostrarBotaoAdd,
  poster,
  subtitulo,
  mostrarBotaoRemover,
  onRemover,
  genre_ids,
  tipo = "movie",
}) {

  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);

  function handleClick() {
    navigate(tipo === "tv" ? `/serie/${id}` : `/filme/${id}`);
  }

  function handleAdicionar(e) {
    e.stopPropagation();

    const resultado = adicionarNaLista({
      id,
      title: titulo,
      poster_path: poster,
      release_date: subtitulo,
      genre_ids,
      tipo,
    });

    setFeedback({
      tipo: resultado.sucesso ? "success" : "info",
      titulo: resultado.sucesso ? "Adicionado à lista" : "Já está na lista",
      mensagem: resultado.mensagem,
    });
  }

  function handleRemover(e) {
    e.stopPropagation();
    onRemover?.(id);
  }

  return (
    <div
      className={styles.movieItem}
      onClick={handleClick}
    >
      <div
        className={styles.moviePoster}
        style={
          poster
            ? {
                backgroundImage: `url(${poster})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {mostrarBotaoAdd && (
          <button className={styles.addBtn} onClick={handleAdicionar}>
            +
          </button>
        )}

        {mostrarBotaoRemover && (
          <button className={styles.removeBtn} onClick={handleRemover}>
            x
          </button>
        )}
      </div>

      <p>{titulo}</p>

      {subtitulo && (
        <span className={styles.movieSubtitulo}>
          {subtitulo}
        </span>
      )}

      <FeedbackModal
        aberto={Boolean(feedback)}
        tipo={feedback?.tipo}
        titulo={feedback?.titulo}
        mensagem={feedback?.mensagem}
        onFechar={() => setFeedback(null)}
      />
    </div>
  );
}
