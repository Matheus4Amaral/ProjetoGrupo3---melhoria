import { useState, useEffect } from "react";
import "./ComentariosFilme.css";
import { alertService } from "../utils/alertService";

const API_URL = "http://localhost:3000";

export default function ComentariosFilme({ filmeId }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState("");

  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    carregarComentarios();
  }, [filmeId]);

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

  async function handleEnviar(e) {
    e.preventDefault();
    setErro("");

    if (!usuarioId) {
      setErro("Você precisa estar logado para comentar.");
      return;
    }
    if (!texto.trim()) return;

    setEnviando(true);
    try {
      const response = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, filmeId, comentario: texto }),
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
    if (!textoEdicao.trim()) return;

    try {
      const response = await fetch(`${API_URL}/comentarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, comentario: textoEdicao }),
      });

      const data = await response.json();

      if (!response.ok) {
        alertService.show(data.erro || "Erro ao editar comentário.", "erro")
        return
      }

      setComentarios((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, comentario: data.comentario } : c,
        ),
      );
      cancelarEdicao();
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
      alertService.show("Não foi possível conectar ao servidor.", "erro")
    }
  }

  async function excluirComentario(id) {
    const confirmou = await alertService.confirm("Excluir esse comentário?")
    if (!confirmou) return

    try {
      const response = await fetch(`${API_URL}/comentarios/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alertService.show(data.erro || "Erro ao excluir comentário.", "erro")
        return
      }

      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
      alertService.show("Não foi possível conectar ao servidor.", "erro")
    }
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
                      <button onClick={() => excluirComentario(c.id)}>
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
    </section>
  );
}
