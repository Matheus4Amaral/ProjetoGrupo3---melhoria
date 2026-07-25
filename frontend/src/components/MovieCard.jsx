import { useNavigate } from "react-router-dom";
import styles from "./MovieCard.module.css";
import { adicionarNaLista } from "../utils/minhaLista";
import { useToast } from "./ToastContext.jsx";

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
  aoAtualizarLista, //Callback para notificar o componente pai sobre (ex: Inicio.jsx) mudanças na lista (atualiza contadores sem F5).
}) {
  const navigate = useNavigate();
  const mostrarToast = useToast();

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

    mostrarToast(resultado.mensagem, resultado.sucesso ? "sucesso" : "erro");

    // NOVO: Notifica o pai para atualizar contadores apenas se a adição for bem-sucedida (item não repetido).
    if (resultado.sucesso) {
      aoAtualizarLista?.();
    }
  }

  function handleRemover(e) {
    e.stopPropagation();
    onRemover?.(id);

    // NOVO: Notifica o pai após a remoção para recalcular os contadores automaticamente.
    aoAtualizarLista?.();
  }

  return (
    <div className={styles.movieItem} onClick={handleClick}>
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

      {subtitulo && <span className={styles.movieSubtitulo}>{subtitulo}</span>}
    </div>
  );
}
