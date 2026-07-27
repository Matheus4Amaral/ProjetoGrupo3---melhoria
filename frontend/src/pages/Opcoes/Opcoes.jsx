import { useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { useToast } from "../../components/ToastContext.jsx";
import styles from "./Opcoes.module.css";

const API_URL = "http://localhost:3000";

// Regra de senha forte: mínimo 8 caracteres, pelo menos 1 número e
// pelo menos 1 caractere especial. (mesma regra do formulário de Cadastro)
const REGEX_SENHA_FORTE = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/;

export default function Opcoes() {
  const mostrarToast = useToast();
  const usuarioId = localStorage.getItem("usuarioId");

  const [nome, setNome] = useState(localStorage.getItem("usuarioNome") || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  const querTrocarSenha = novaSenha.length > 0 || confirmarSenha.length > 0;

  // Critérios de senha avaliados em tempo real, para mostrar o checklist
  const criteriosSenha = {
    tamanho: novaSenha.length >= 8,
    numero: /[0-9]/.test(novaSenha),
    especial: /[!@#$%^&*(),.?":{}|<>_\-]/.test(novaSenha),
  };
  const novaSenhaValida = REGEX_SENHA_FORTE.test(novaSenha);
  const senhasCoincidem = novaSenha === confirmarSenha;

  async function handleSalvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      mostrarToast("O nome não pode ficar vazio.", "erro");
      return;
    }

    if (querTrocarSenha) {
      if (!senhaAtual) {
        mostrarToast("Informe sua senha atual para trocar a senha.", "erro");
        return;
      }
      if (!novaSenhaValida) {
        mostrarToast(
          "A nova senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 caractere especial.",
          "erro",
        );
        return;
      }
      if (!senhasCoincidem) {
        mostrarToast("As senhas não coincidem.", "erro");
        return;
      }
    }

    setSalvando(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          senhaAtual: querTrocarSenha ? senhaAtual : undefined,
          novaSenha: querTrocarSenha ? novaSenha : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarToast(data.erro || "Erro ao atualizar dados.", "erro");
        return;
      }

      localStorage.setItem("usuarioNome", data.usuarioNome);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      mostrarToast("Dados atualizados com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      mostrarToast("Não foi possível conectar ao servidor.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Sidebar />
      <main className={styles.mainContent}>
        <h1 className={styles.titulo}>Opções</h1>
        <h2 className={styles.subtitulo}>Atualize os seus dados de cadastro.</h2>

        <form onSubmit={handleSalvar} className={styles.card}>
          <h2 className={styles.cardSubtitulo}>Dados da conta</h2>

          <div className={styles.inputGroup}>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <h2 className={styles.cardSubtitulo}>Trocar senha</h2>
          <p className={styles.instrucao}>
            Deixe em branco se não quiser alterar sua senha.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="senhaAtual">Senha atual</label>
            <input
              id="senhaAtual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {querTrocarSenha && (
            <ul className={styles.checklist}>
              <li className={criteriosSenha.tamanho ? styles.valido : styles.invalido}>
                {criteriosSenha.tamanho ? "✓" : "✗"} Mínimo de 8 caracteres
              </li>
              <li className={criteriosSenha.numero ? styles.valido : styles.invalido}>
                {criteriosSenha.numero ? "✓" : "✗"} Pelo menos 1 número
              </li>
              <li className={criteriosSenha.especial ? styles.valido : styles.invalido}>
                {criteriosSenha.especial ? "✓" : "✗"} Pelo menos 1 caractere especial
              </li>
              <li className={senhasCoincidem ? styles.valido : styles.invalido}>
                {senhasCoincidem ? "✓" : "✗"} As senhas coincidem
              </li>
            </ul>
          )}

          <button type="submit" className={styles.btnSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </main>
    </>
  );
}