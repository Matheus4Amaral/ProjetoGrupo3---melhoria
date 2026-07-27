import styles from "./StatCard.module.css";

export default function StatCard({ valor, legenda, corTexto }) {
  return (
    <div className={styles.statCard}>
      <h2 className={styles[corTexto]}>{valor}</h2>
      <span>{legenda}</span>
    </div>
  );
}
