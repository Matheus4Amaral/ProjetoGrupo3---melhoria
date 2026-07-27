import { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar.jsx";
import {
  loginSchema,
  obterErrosPorCampo,
} from "../../schemas/validationSchemas";

function Login() {
  const navigate = useNavigate();

  // Trocado de 'username' para 'email' para bater com o banco de dados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const validacao = loginSchema.safeParse({ email, password });

    if (!validacao.success) {
      setFieldErrors(obterErrosPorCampo(validacao.error));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validacao.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setFieldErrors(data.campos || {});
        setError(data.erro || "Falha ao fazer login.");
        setIsLoading(false);
        return;
      }

      // Sucesso! Salva o ID do usuário no navegador para usarmos nas outras telas
      localStorage.setItem("usuarioId", data.usuarioId);
      localStorage.setItem("usuarioNome", data.usuarioNome); 

      // Redireciona para o Início (ou para o Catálogo/Minha Lista, dependendo das suas rotas)
      navigate("/inicio");
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      setError("Não foi possível conectar ao servidor.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="loginPage">
        <div className="loginCard">
          <div className="cardLogo">
            <div className="rayIcon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="logoTitle">
              Flash<span className="logoSuffix">View</span>
            </h1>
          </div>

          {error && <div className="errorAlert">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="inputBox">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((erros) => ({ ...erros, email: undefined }));
                }}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              />
              {fieldErrors.email && (
                <span id="login-email-error" className="fieldError">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="inputBox">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((erros) => ({
                    ...erros,
                    password: undefined,
                  }));
                }}
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "login-password-error" : undefined
                }
              />
              {fieldErrors.password && (
                <span id="login-password-error" className="fieldError">
                  {fieldErrors.password}
                </span>
              )}
              <div className="forgotContainer">
                <Link to="/EsqueceuSenha" className="forgotLink">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="submitBtn">
              {isLoading ? "Entrando..." : "Login"}
            </button>

            <div className="footerRegister">
              Novo por aqui? <Link to="/Cadastro">Cadastrar</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
