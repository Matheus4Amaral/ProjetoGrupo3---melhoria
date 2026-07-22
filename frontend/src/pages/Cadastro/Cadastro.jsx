import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importando useNavigate
import styles from "./Cadastro.module.css";
import NavBar from "../../components/Navbar/Navbar";

const Cadastro = () => {
  const navigate = useNavigate(); // Inicializa o hook de navegação

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

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

          <label>Confirmar Senha</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className={styles.btnSubmit}>
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
