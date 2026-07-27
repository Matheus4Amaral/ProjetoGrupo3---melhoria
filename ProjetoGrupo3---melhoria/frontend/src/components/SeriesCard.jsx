import styles from "./SeriesCard.module.css";

export default function SeriesCard({
  titulo,
  subtitulo,
  textoBotao,
  finalizado,
  iconeAssistido,
}) {
  return (
    <div className={styles.seriesCard}>
      <div className={styles.seriesImagePlaceholder}></div>
      <div className={styles.seriesInfo}>
        <h4>{titulo}</h4>
        <p>{subtitulo}</p>
        <button className={`${styles.btnMark} ${finalizado ? styles.btnDone : ""}`}>
          {textoBotao}
          {finalizado && iconeAssistido && (
            <img
              src={iconeAssistido}
              alt="Check"
              style={{ width: "14px", height: "14px", marginLeft: "5px" }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
