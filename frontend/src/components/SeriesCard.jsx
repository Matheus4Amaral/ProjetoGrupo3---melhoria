import { useNavigate } from "react-router-dom";
import styles from "./SeriesCard.module.css";
import { adicionarNaLista } from "../utils/minhaLista";
import { useAlert } from "../contexts/AlertContext.jsx";

export default function SeriesCard({
  id,
  titulo,
  mostrarBotaoAdd,
  poster,
  subtitulo,
  mostrarBotaoRemover,
  onRemover,
  genre_ids,
  tipo,
}) {
  const { mostrarAlerta } = useAlert();
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/serie/${id}`);
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

    mostrarAlerta({
      titulo: resultado.sucesso ? "Sucesso" : "Aviso",
      mensagem: resultado.mensagem,
      textoConfirmar: "OK",
    });

    if (resultado.sucesso) {
      window.dispatchEvent(new Event("stats-atualizados"));
    }
  }

  function handleRemover(e) {
    e.stopPropagation();
    onRemover?.(id);
  }

  return (
    <div className={styles.seriesCard} onClick={handleClick}>
      <div
        className={styles.seriesImagePlaceholder}
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
        <span className={styles.serieSubtitulo}>
          {subtitulo}
        </span>
      )}
    </div>
  );
}