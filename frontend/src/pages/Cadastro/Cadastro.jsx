import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importando useNavigate
import styles from "./Cadastro.module.css";
import NavBar from "../../components/Navbar/Navbar";
import FeedbackModal from "../../components/FeedbackModal";
import {
  cadastroSchema,
  obterErrosPorCampo,
} from "../../schemas/validationSchemas";

const Cadastro = () => {
  const navigate = useNavigate(); // Inicializa o hook de navegação

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  function fecharFeedback() {
    const deveRedirecionar = feedback?.redirecionar;
    setFeedback(null);
    if (deveRedirecionar) navigate("/");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((erros) => ({ ...erros, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFeedback({
        tipo: "error",
        titulo: "Senhas diferentes",
        mensagem: "As senhas informadas não coincidem. Confira e tente novamente.",
      });
      return;
    }

    const validacao = cadastroSchema.safeParse(formData);

    if (!validacao.success) {
      setFieldErrors(obterErrosPorCampo(validacao.error));
      return;
    }

    try {
      // Chama a API do Node.js
      const response = await fetch("http://localhost:3000/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: validacao.data.name,
          email: validacao.data.email,
          password: validacao.data.password,
        }),
      });

      const data = await response.json();

      // Se o status HTTP não for OK (ex: 400 ou 500)
      if (!response.ok) {
        setFieldErrors(data.campos || {});
        setFeedback({
          tipo: "error",
          titulo: "Não foi possível cadastrar",
          mensagem: data.erro || "Revise os dados e tente novamente.",
        });
        return;
      }

      // Sucesso!
      setFeedback({
        tipo: "success",
        titulo: "Cadastro concluído",
        mensagem: "Sua conta foi criada. Agora você já pode fazer login.",
        redirecionar: true,
      });
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      setFeedback({
        tipo: "error",
        titulo: "Servidor indisponível",
        mensagem:
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
      });
    }
  }

  return (
    <>
      <NavBar />
      <div className={styles.registerPage}>
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <h2>Cadastro</h2>

          <label htmlFor="name">Nome Completo</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "cadastro-name-error" : undefined}
          />
          {fieldErrors.name && (
            <span id="cadastro-name-error" className={styles.fieldError}>
              {fieldErrors.name}
            </span>
          )}

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "cadastro-email-error" : undefined
            }
          />
          {fieldErrors.email && (
            <span id="cadastro-email-error" className={styles.fieldError}>
              {fieldErrors.email}
            </span>
          )}

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "cadastro-password-error" : undefined
            }
          />
          {fieldErrors.password && (
            <span id="cadastro-password-error" className={styles.fieldError}>
              {fieldErrors.password}
            </span>
          )}

          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword
                ? "cadastro-confirm-password-error"
                : undefined
            }
          />
          {fieldErrors.confirmPassword && (
            <span
              id="cadastro-confirm-password-error"
              className={styles.fieldError}
            >
              {fieldErrors.confirmPassword}
            </span>
          )}

          <button type="submit" className={styles.btnSubmit}>
            Cadastrar
          </button>

          <div className={styles.loginRedirect}>
            Já Possui Uma Conta? <Link to="/">Login</Link>
          </div>
        </form>
      </div>

      <FeedbackModal
        aberto={Boolean(feedback)}
        tipo={feedback?.tipo}
        titulo={feedback?.titulo}
        mensagem={feedback?.mensagem}
        textoConfirmar={feedback?.redirecionar ? "Ir para o login" : "Entendi"}
        onFechar={fecharFeedback}
        onConfirmar={fecharFeedback}
      />
    </>
  );
};

export default Cadastro;
