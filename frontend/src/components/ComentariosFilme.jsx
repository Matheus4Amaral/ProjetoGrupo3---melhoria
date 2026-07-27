import { useState, useEffect } from "react";
import "./ComentariosFilme.css";
import FeedbackModal from "./FeedbackModal";
import { comentarioSchema } from "../schemas/validationSchemas";

const API_URL = "http://localhost:3000";

export default function ComentariosFilme({ filmeId }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [comentarioParaExcluir, setComentarioParaExcluir] = useState(null);

  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    async function carregarComentarios() {
    try {
      const response = await fetch(`${API_URL}/comentarios/${filmeId}`, {
        cache: "no-store", // <- adiciona essa opção
      });
      const data = await response.json();
      setComentarios(data);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
    }

    carregarComentarios();
  }, [filmeId]);

  async function handleEnviar(e) {
    e.preventDefault();
    setErro("");

    if (!usuarioId) {
      setErro("Você precisa estar logado para comentar.");
      return;
    }
    const validacao = comentarioSchema.safeParse(texto);

    if (!validacao.success) {
      setErro(validacao.error.issues[0]?.message || "Comentário inválido.");
      return;
    }

    setEnviando(true);
    try {
      const response = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          filmeId,
          comentario: validacao.data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.erro || "Erro ao enviar comentário.");
        return;
      }

      // Adiciona o usuario_id manualmente pra já poder editar/excluir sem recarregar
      setComentarios((prev) => [
        { ...data, usuario_id: Number(usuarioId) },
        ...prev,
      ]);
      setTexto("");
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(comentario) {
    setEditandoId(comentario.id);
    setTextoEdicao(comentario.comentario);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setTextoEdicao("");
  }

  async function salvarEdicao(id) {
    const validacao = comentarioSchema.safeParse(textoEdicao);

    if (!validacao.success) {
      setFeedback({
        tipo: "error",
        titulo: "Comentário inválido",
        mensagem: validacao.error.issues[0]?.message,
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/comentarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          comentario: validacao.data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          tipo: "error",
          titulo: "Não foi possível editar",
          mensagem: data.erro || "O comentário não pôde ser atualizado.",
        });
        return;
      }

      setComentarios((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, comentario: data.comentario } : c,
        ),
      );
      cancelarEdicao();
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
      setFeedback({
        tipo: "error",
        titulo: "Servidor indisponível",
        mensagem: "Não foi possível conectar ao servidor.",
      });
    }
  }

  function solicitarExclusao(id) {
    setComentarioParaExcluir(id);
    setFeedback({
      tipo: "confirm",
      titulo: "Excluir comentário?",
      mensagem: "Essa ação é permanente e não poderá ser desfeita.",
    });
  }

  async function confirmarExclusao() {
    const id = comentarioParaExcluir;
    setFeedback(null);
    setComentarioParaExcluir(null);

    try {
      const response = await fetch(`${API_URL}/comentarios/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          tipo: "error",
          titulo: "Não foi possível excluir",
          mensagem: data.erro || "O comentário não pôde ser excluído.",
        });
        return;
      }

      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
      setFeedback({
        tipo: "error",
        titulo: "Servidor indisponível",
        mensagem: "Não foi possível conectar ao servidor.",
      });
    }
  }

  function fecharFeedback() {
    setFeedback(null);
    setComentarioParaExcluir(null);
  }

  return (
    <section className="comentarios-section">
      <h3>Comentários</h3>

      <form onSubmit={handleEnviar} className="comentario-form">
        <textarea
          placeholder={
            usuarioId ? "Escreva um comentário..." : "Faça login para comentar"
          }
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={!usuarioId || enviando}
          rows={3}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!usuarioId || enviando || !texto.trim()}
        >
          {enviando ? "Enviando..." : "Comentar"}
        </button>
      </form>

      {erro && <p className="comentario-erro">{erro}</p>}

      <div className="comentario-lista">
        {comentarios.length === 0 ? (
          <p className="comentario-vazio">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        ) : (
          comentarios.map((c) => {
            const ehDono =
              usuarioId && String(c.usuario_id) === String(usuarioId);
            const estaEditando = editandoId === c.id;

            return (
              <div key={c.id} className="comentario-item">
                <div className="comentario-header">
                  <div>
                    <strong>{c.nome}</strong>
                    <span className="comentario-data">
                      {new Date(c.data_avaliacao).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {ehDono && !estaEditando && (
                    <div className="comentario-acoes">
                      <button onClick={() => iniciarEdicao(c)}>Editar</button>
                      <button onClick={() => solicitarExclusao(c.id)}>
                        Excluir
                      </button>
                    </div>
                  )}
                </div>

                {estaEditando ? (
                  <div className="comentario-edicao">
                    <textarea
                      value={textoEdicao}
                      onChange={(e) => setTextoEdicao(e.target.value)}
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="comentario-edicao-acoes">
                      <button onClick={() => salvarEdicao(c.id)}>Salvar</button>
                      <button onClick={cancelarEdicao}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <p>{c.comentario}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <FeedbackModal
        aberto={Boolean(feedback)}
        tipo={feedback?.tipo}
        titulo={feedback?.titulo}
        mensagem={feedback?.mensagem}
        textoConfirmar={
          feedback?.tipo === "confirm" ? "Excluir" : "Entendi"
        }
        onFechar={fecharFeedback}
        onConfirmar={
          feedback?.tipo === "confirm" ? confirmarExclusao : fecharFeedback
        }
      />
    </section>
  );
}
