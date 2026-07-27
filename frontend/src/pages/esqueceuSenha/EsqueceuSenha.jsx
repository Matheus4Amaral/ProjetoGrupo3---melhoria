import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar.jsx";
import "./EsqueceuSenha.css";
import {
  emailSchema,
  obterErrosPorCampo,
  redefinirSenhaSchema,
} from "../../schemas/validationSchemas";

const API_URL = "http://localhost:3000";

export default function EsqueceuSenha() {
  const [contato, setContato] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [etapa, setEtapa] = useState(1); // 1 = Digitar e-mail, 2 = Digitar nova senha
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleProcurar(e) {
    e.preventDefault();
    setErro("");
    setFieldErrors({});

    const validacao = emailSchema.safeParse(contato);

    if (!validacao.success) {
      setFieldErrors({ contato: validacao.error.issues[0]?.message });
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/verificar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validacao.data }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.erro || "E-mail não encontrado.");
        return;
      }

      setEtapa(2);
    } catch (err) {
      console.error("Erro ao verificar e-mail:", err);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir(e) {
    e.preventDefault();
    setErro("");
    setFieldErrors({});

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    const validacao = redefinirSenhaSchema.safeParse({
      email: contato,
      novaSenha,
      confirmarSenha,
    });

    if (!validacao.success) {
      setFieldErrors(obterErrosPorCampo(validacao.error));
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: validacao.data.email,
          novaSenha: validacao.data.novaSenha,
        }),
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

            {etapa === 1 ? (
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
                    onChange={(e) => {
                      setContato(e.target.value);
                      setFieldErrors((erros) => ({
                        ...erros,
                        contato: undefined,
                      }));
                    }}
                    className="input-field"
                    required
                    aria-invalid={Boolean(fieldErrors.contato)}
                    aria-describedby={
                      fieldErrors.contato ? "recuperacao-email-error" : undefined
                    }
                  />
                  {fieldErrors.contato && (
                    <span id="recuperacao-email-error" className="field-error">
                      {fieldErrors.contato}
                    </span>
                  )}
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
                    {carregando ? "Procurando..." : "Procurar"}
                  </button>
                </div>
              </form>
            ) : (
              /* =========================================
               ETAPA 2: DEFINIR NOVA SENHA
               ========================================= */
              <form onSubmit={handleRedefinir} className="form-container">
                <p className="instruction-text">Digite sua nova senha</p>

                <div className="input-group">
                  <label htmlFor="novaSenha">Nova senha</label>
                  <input
                    type="password"
                    id="novaSenha"
                    value={novaSenha}
                    onChange={(e) => {
                      setNovaSenha(e.target.value);
                      setFieldErrors((erros) => ({
                        ...erros,
                        novaSenha: undefined,
                      }));
                    }}
                    className="input-field"
                    required
                    aria-invalid={Boolean(fieldErrors.novaSenha)}
                    aria-describedby={
                      fieldErrors.novaSenha
                        ? "recuperacao-password-error"
                        : undefined
                    }
                  />
                  {fieldErrors.novaSenha && (
                    <span id="recuperacao-password-error" className="field-error">
                      {fieldErrors.novaSenha}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="confirmarSenha">Confirmar senha</label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value);
                      setFieldErrors((erros) => ({
                        ...erros,
                        confirmarSenha: undefined,
                      }));
                    }}
                    className="input-field"
                    required
                    aria-invalid={Boolean(fieldErrors.confirmarSenha)}
                    aria-describedby={
                      fieldErrors.confirmarSenha
                        ? "recuperacao-confirm-password-error"
                        : undefined
                    }
                  />
                  {fieldErrors.confirmarSenha && (
                    <span
                      id="recuperacao-confirm-password-error"
                      className="field-error"
                    >
                      {fieldErrors.confirmarSenha}
                    </span>
                  )}
                </div>

                <div className="actions-row center">
                  <button
                    type="submit"
                    className="btn-solid btn-medium"
                    disabled={carregando}
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
