import { useEffect, useRef, useState } from "react";
import { alertService } from "../../utils/alertService";
import styles from "./AlertProvider.module.css";

const DURACAO_TOAST_MS = 4000

let proximoId = 1

export default function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmAtual, setConfirmAtual] = useState(null)
  const timersRef = useRef({});

  useEffect(() => {
    alertService._register({
      show: (message, type = "info") => {
        const id = proximoId++;
        setToasts((prev) => [...prev, { id, message, type, saindo: false }])
        timersRef.current[id] = setTimeout(
          () => fecharToast(id),
          DURACAO_TOAST_MS,
        )
      },
      confirm: (message) =>
        new Promise((resolve) => setConfirmAtual({ message, resolve })),
    })

    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    }
  }, [])

  function fecharToast(id) {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];


    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, saindo: true } : t)),
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 200)
  }

  function responderConfirm(resposta) {
    confirmAtual?.resolve(resposta)
    setConfirmAtual(null)
  }

  return (
    <>
      {children}

      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type] || ""} ${
              toast.saindo ? styles.saindo : ""
            }`}
          >
            <p className={styles.toastMensagem}>{toast.message}</p>
            <button
              className={styles.toastFechar}
              onClick={() => fecharToast(toast.id)}
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {confirmAtual && (
        <div className={styles.overlay}>
          <div className={styles.box} onClick={(e) => e.stopPropagation()}>
            <p className={styles.mensagem}>{confirmAtual.message}</p>
            <div className={styles.acoes}>
              <button
                className={styles.btnSecundario}
                onClick={() => responderConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnPrimario}
                onClick={() => responderConfirm(true)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
