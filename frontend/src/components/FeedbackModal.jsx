import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./FeedbackModal.css";

const ICONES = {
  success: "✓",
  error: "!",
  info: "i",
  confirm: "?",
};

export default function FeedbackModal({
  aberto,
  titulo,
  mensagem,
  tipo = "info",
  textoConfirmar = "Entendi",
  textoCancelar = "Cancelar",
  onConfirmar,
  onFechar,
}) {
  const tituloId = useId();
  const descricaoId = useId();
  const botaoRef = useRef(null);
  const exibirCancelar = tipo === "confirm";

  useEffect(() => {
    if (!aberto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botaoRef.current?.focus();

    function fecharComEscape(event) {
      if (event.key === "Escape") {
        onFechar?.();
      }
    }

    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  function confirmar(event) {
    event.stopPropagation();
    if (onConfirmar) {
      onConfirmar();
      return;
    }
    onFechar?.();
  }

  return createPortal(
    <div
      className="feedback-modal-overlay"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onFechar?.();
      }}
    >
      <div
        className={`feedback-modal feedback-modal--${tipo}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descricaoId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="feedback-modal__fechar"
          aria-label="Fechar"
          onClick={onFechar}
        >
          ×
        </button>

        <div className="feedback-modal__icone" aria-hidden="true">
          {ICONES[tipo] || ICONES.info}
        </div>

        <h2 id={tituloId}>{titulo}</h2>
        <p id={descricaoId}>{mensagem}</p>

        <div className="feedback-modal__acoes">
          {exibirCancelar && (
            <button
              type="button"
              className="feedback-modal__botao feedback-modal__botao--secundario"
              onClick={onFechar}
            >
              {textoCancelar}
            </button>
          )}

          <button
            ref={botaoRef}
            type="button"
            className="feedback-modal__botao feedback-modal__botao--principal"
            onClick={confirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
