import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastContext";
import NavBar from "../../components/Navbar/Navbar";
import "./EsqueceuSenha.css";

export default function EsqueceuSenha() {
  const [etapa, setEtapa] = useState(1); // 1: Email, 2: Código, 3: Nova Senha
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const mostrarToast = useToast();
  const navigate = useNavigate();

  // Validações para a etapa 3
  const senhasCoincidem = novaSenha === confirmaSenha;
  const senhaValida = novaSenha.length >= 6;

  async function handleEnviarEmail(e) {
    e.preventDefault();
    setCarregando(true);
    try {
      const res = await fetch("http://localhost:3000/verificar-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      mostrarToast(data.mensagem, "sucesso");
      setEtapa(2);
    } catch (err) {
      mostrarToast(err.message || "Erro ao enviar e-mail.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  async function handleVerificarCodigo(e) {
    e.preventDefault();
    setCarregando(true);
    try {
      const res = await fetch("http://localhost:3000/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      mostrarToast(data.mensagem, "sucesso");
      setEtapa(3);
    } catch (err) {
      mostrarToast(err.message || "Erro ao validar código.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinirSenha(e) {
    e.preventDefault();
    if (!senhaValida || !senhasCoincidem) return;

    setCarregando(true);
    try {
      const res = await fetch("http://localhost:3000/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro);

      mostrarToast(data.mensagem, "sucesso");
      navigate("/"); // Volta para o login
    } catch (err) {
      mostrarToast(err.message || "Erro ao redefinir senha.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  function renderizarEtapa() {
    switch (etapa) {
      case 1:
        return (
          <form onSubmit={handleEnviarEmail} className="form-container">
            <h2 className="card-title">Recuperar Senha</h2>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail de cadastro"
                required
              />
            </div>
            <div className="actions-row center">
              <button
                type="submit"
                className="btn-solid btn-medium"
                disabled={carregando}
              >
                {carregando ? "Enviando..." : "Enviar Código"}
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerificarCodigo} className="form-container">
            <h2 className="card-title">Verifique seu E-mail</h2>
            <p className="instruction-text">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>.
              Insira-o abaixo para continuar.
            </p>
            <div className="input-group">
              <label htmlFor="codigo">Código de Verificação</label>
              <input
                id="codigo"
                type="text"
                className="input-field"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className="actions-row center">
              <button
                type="submit"
                className="btn-solid btn-medium"
                disabled={carregando}
              >
                {carregando ? "Verificando..." : "Verificar"}
              </button>
            </div>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleRedefinirSenha} className="form-container">
            <h2 className="card-title">Crie uma Nova Senha</h2>
            <div className="input-group">
              <label htmlFor="novaSenha">Nova Senha</label>
              <input
                id="novaSenha"
                type="password"
                className="input-field"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmaSenha">Confirmar Nova Senha</label>
              <input
                id="confirmaSenha"
                type="password"
                className="input-field"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                required
              />
            </div>
            <div className="actions-row center">
              <button
                type="submit"
                className="btn-solid btn-medium"
                disabled={carregando || !senhasCoincidem || !senhaValida}
              >
                {carregando ? "Salvando..." : "Redefinir Senha"}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  }

  return (
    <div className="esqueceu-senha-page">
      <NavBar />
      <main className="main-content">
        <div className="card">
          {renderizarEtapa()}
          <p className="footer-text">
            Lembrou sua senha?{" "}
            <Link to="/" className="link-highlight">
              Voltar para o Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}