import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar.jsx";
import "./EsqueceuSenha.css";

// Se não achar a variável, ele usa "" (vazio)
const API_URL = import.meta.env.VITE_API_URL || "";

// Regra de senha forte: mínimo 8 caracteres, pelo menos 1 número e
// pelo menos 1 caractere especial.
const REGEX_SENHA_FORTE = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/;

export default function EsqueceuSenha() {
  const [contato, setContato] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [etapa, setEtapa] = useState(1); // 1 = e-mail, 2 = código, 3 = nova senha
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const criteriosSenha = {
    tamanho: novaSenha.length >= 8,
    numero: /[0-9]/.test(novaSenha),
    especial: /[!@#$%^&*(),.?":{}|<>_\-]/.test(novaSenha),
  };
  const senhaValida = REGEX_SENHA_FORTE.test(novaSenha);

  // Etapa 1: envia o e-mail e pede pro backend gerar/enviar o código
  async function handleProcurar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/verificar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contato }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.erro || "E-mail não encontrado.");
        return;
      }

      setSucesso("Código enviado! Verifique sua caixa de entrada.");
      setEtapa(2);
    } catch (err) {
      console.error("Erro ao verificar e-mail:", err);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  // Etapa 2: confirma o código digitado
  async function handleValidarCodigo(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!codigo || codigo.length !== 6) {
      setErro("Digite o código de 6 dígitos enviado para o seu e-mail.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contato, codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.erro || "Código inválido.");
        return;
      }

      setEtapa(3);
    } catch (err) {
      console.error("Erro ao validar código:", err);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  // Reenvia o código (repete a etapa 1 sem trocar de tela)
  async function handleReenviarCodigo() {
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/verificar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contato }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.erro || "Não foi possível reenviar o código.");
        return;
      }

      setSucesso("Um novo código foi enviado para o seu e-mail.");
    } catch (err) {
      console.error("Erro ao reenviar código:", err);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  // Etapa 3: define a nova senha
  async function handleRedefinir(e) {
    e.preventDefault();
    setErro("");

    if (!senhaValida) {
      setErro(
        "A senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 caractere especial.",
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contato, novaSenha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.erro || "Erro ao redefinir senha.");
        return;
      }

      setSucesso(
        "Senha redefinida com sucesso! Redirecionando para o login...",
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  function handleVoltar() {
    navigate("/");
  }

  return (
    <>
      <Navbar />

      <div className="esqueceu-senha-page">
        <main className="main-content">
          <div className="card">
            <h2 className="card-title">Esqueceu a Senha</h2>

            {erro && (
              <p className="instruction-text" style={{ color: "#ff6b6b" }}>
                {erro}
              </p>
            )}
            {sucesso && (
              <p className="instruction-text" style={{ color: "#4caf50" }}>
                {sucesso}
              </p>
            )}

            {etapa === 1 && (
              /* =========================================
               ETAPA 1: SOLICITAR E-MAIL
               ========================================= */
              <form onSubmit={handleProcurar} className="form-container">
                <div className="input-group">
                  <label htmlFor="contato">E-mail</label>
                  <input
                    type="email"
                    id="contato"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="actions-row space-between">
                  <button
                    type="button"
                    className="btn-solid btn-small"
                    onClick={handleVoltar}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="btn-solid btn-small"
                    disabled={carregando}
                  >
                    {carregando ? "Enviando..." : "Enviar código"}
                  </button>
                </div>
              </form>
            )}

            {etapa === 2 && (
              /* =========================================
               ETAPA 2: DIGITAR O CÓDIGO RECEBIDO POR E-MAIL
               ========================================= */
              <form onSubmit={handleValidarCodigo} className="form-container">
                <p className="instruction-text">
                  Enviamos um código de 6 dígitos para{" "}
                  <strong>{contato}</strong>. Digite-o abaixo.
                </p>

                <div className="input-group">
                  <label htmlFor="codigo">Código de verificação</label>
                  <input
                    type="text"
                    id="codigo"
                    value={codigo}
                    onChange={(e) =>
                      setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="input-field"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    required
                  />
                </div>

                <div className="actions-row space-between">
                  <button
                    type="button"
                    className="btn-solid btn-small"
                    onClick={() => setEtapa(1)}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="btn-solid btn-small"
                    disabled={carregando}
                  >
                    {carregando ? "Validando..." : "Validar"}
                  </button>
                </div>

                <p className="footer-text">
                  Não recebeu?{" "}
                  <span
                    className="link-highlight"
                    style={{ cursor: "pointer" }}
                    onClick={!carregando ? handleReenviarCodigo : undefined}
                  >
                    Reenviar código
                  </span>
                </p>
              </form>
            )}

            {etapa === 3 && (
              /* =========================================
               ETAPA 3: DEFINIR NOVA SENHA
               ========================================= */
              <form onSubmit={handleRedefinir} className="form-container">
                <p className="instruction-text">Digite sua nova senha</p>

                <div className="input-group">
                  <label htmlFor="novaSenha">Nova senha</label>
                  <input
                    type="password"
                    id="novaSenha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="input-field"
                    required
                  />

                  {novaSenha && (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "10px 0 0 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      <li
                        style={{
                          fontSize: "12px",
                          color: criteriosSenha.tamanho ? "#2ab8a1" : "#a1a1aa",
                        }}
                      >
                        {criteriosSenha.tamanho ? "✓" : "✗"} Mínimo de 8
                        caracteres
                      </li>
                      <li
                        style={{
                          fontSize: "12px",
                          color: criteriosSenha.numero ? "#2ab8a1" : "#a1a1aa",
                        }}
                      >
                        {criteriosSenha.numero ? "✓" : "✗"} Pelo menos 1 número
                      </li>
                      <li
                        style={{
                          fontSize: "12px",
                          color: criteriosSenha.especial
                            ? "#2ab8a1"
                            : "#a1a1aa",
                        }}
                      >
                        {criteriosSenha.especial ? "✓" : "✗"} Pelo menos 1
                        caractere especial
                      </li>
                    </ul>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="confirmarSenha">Confirmar senha</label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="actions-row center">
                  <button
                    type="submit"
                    className="btn-solid btn-medium"
                    disabled={
                      carregando || !senhaValida || novaSenha !== confirmarSenha
                    }
                  >
                    {carregando ? "Salvando..." : "Redefinir senha"}
                  </button>
                </div>

                <p className="footer-text">
                  Já Possui Uma Conta?{" "}
                  <Link to="/Login" className="link-highlight">
                    Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
