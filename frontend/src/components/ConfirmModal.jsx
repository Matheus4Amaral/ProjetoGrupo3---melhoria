import { createPortal } from "react-dom";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalConfirm} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.btnConfirmar} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}