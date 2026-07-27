import { useEffect } from "react";
import "./CustomAlert.css";

export default function CustomAlert({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "OK",
  textoCancelar = "Cancelar",
  mostrarCancelar = false,
  onFechar,
  onConfirmar,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onFechar();
      }
    }

    if (aberto) {
        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="overlay" onClick={onFechar}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="custom-alert-title"
        aria-describedby="custom-alert-description"
      >
        <h3 id="custom-alert-title" className="title">
          {titulo}
        </h3>

        <p id="custom-alert-description" className="message">
          {mensagem}
        </p>

        <div className="actions">
          {mostrarCancelar && (
            <button className="cancelBtn" onClick={onFechar}>
              {textoCancelar}
            </button>
          )}

          <button className="confirmBtn" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}