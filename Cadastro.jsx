import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importando useNavigate
import styles from "./Cadastro.module.css";
import NavBar from "../../components/Navbar/Navbar";

// Regra de senha forte: mínimo 8 caracteres, pelo menos 1 número e
// pelo menos 1 caractere especial.
const REGEX_SENHA_FORTE = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/;

const Cadastro = () => {
  const navigate = useNavigate(); // Inicializa o hook de navegação

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Critérios de senha avaliados em tempo real, para mostrar o checklist
  const criteriosSenha = {
    tamanho: formData.password.length >= 8,
    numero: /[0-9]/.test(formData.password),
    especial: /[!@#$%^&*(),.?":{}|<>_\-]/.test(formData.password),
  };
  const senhaValida = REGEX_SENHA_FORTE.test(formData.password);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!senhaValida) {
      alert(
        "A senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 caractere especial.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
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
          name: formData.name,
          email: formData.email,
          password: formData.password, // O backend cuida de criptografar
        }),
      });

      const data = await response.json();

      // Se o status HTTP não for OK (ex: 400 ou 500)
      if (!response.ok) {
        alert(data.erro || "Falha ao cadastrar.");
        return;
      }

      // Sucesso!
      alert("Cadastro realizado com sucesso!");
      navigate("/"); // Redireciona o usuário para a tela de Login
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      alert(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
      );
    }
  }

  return (
    <>
      <NavBar />
      <div className={styles.registerPage}>
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <h2>Cadastro</h2>

          <label>Nome Completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {formData.password && (
            <ul className={styles.passwordChecklist}>
              <li className={criteriosSenha.tamanho ? styles.valido : styles.invalido}>
                {criteriosSenha.tamanho ? "✓" : "✗"} Mínimo de 8 caracteres
              </li>
              <li className={criteriosSenha.numero ? styles.valido : styles.invalido}>
                {criteriosSenha.numero ? "✓" : "✗"} Pelo menos 1 número
              </li>
              <li className={criteriosSenha.especial ? styles.valido : styles.invalido}>
                {criteriosSenha.especial ? "✓" : "✗"} Pelo menos 1 caractere especial
              </li>
            </ul>
          )}

          <label>Confirmar Senha</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={
              !senhaValida || formData.password !== formData.confirmPassword
            }
          >
            Cadastrar
          </button>

          <div className={styles.loginRedirect}>
            Já Possui Uma Conta? <Link to="/">Login</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Cadastro;
