const express = require("express"); // Importa a biblioteca do Express para criar o servidor
const cors = require("cors"); // Importa a biblioteca para lidar com requisições HTTP
const { Pool } = require("pg"); // Importa a biblioteca do PostgreSQL
const bcrypt = require("bcrypt"); // Importa a biblioteca de criptografia
require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express();
app.set("etag", false);
app.use(cors());
app.use(express.json());

// Configuração do banco usando as variáveis de ambiente
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Rota de Cadastro
app.post("/cadastro", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email.includes("@")) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }
  if (password.length < 8) {
    return res.status(400).json({ erro: "Senha precisa ter pelo menos 8 caracteres." });
  }


  try {
    // 1. Verifica se o e-mail já existe no banco
    const usuarioExistente = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ erro: "Este e-mail já está em uso." });
    }

    // 2. Criptografa a senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(password, saltRounds);

    // 3. Salva no banco de dados
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)",
      [name, email, senhaHash],
    );

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Rota de Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Busca o usuário no banco pelo e-mail
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    // Se não encontrou ninguém com esse e-mail
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado." });
    }

    const usuario = result.rows[0];

    // 2. Compara a senha digitada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(password, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    // 3. Deu tudo certo! Retorna o ID do usuário para o React guardar
    res.json({
      mensagem: "Login realizado com sucesso!",
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Lista todos os comentários de um filme (com o nome e usuario_id de quem comentou)
app.get("/comentarios/:filmeId", async (req, res) => {
  const { filmeId } = req.params;
  try {
    const result = await pool.query(
      `SELECT avaliacoes.id, avaliacoes.usuario_id, avaliacoes.comentario,
              avaliacoes.nota, avaliacoes.data_avaliacao, usuarios.nome
       FROM avaliacoes
       JOIN usuarios ON usuarios.id = avaliacoes.usuario_id
       WHERE avaliacoes.filme_id = $1 AND avaliacoes.comentario IS NOT NULL
       ORDER BY avaliacoes.data_avaliacao DESC`,
      [filmeId],
    );
    res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao buscar comentários:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Cria um novo comentário
app.post("/comentarios", async (req, res) => {
  const { usuarioId, filmeId, comentario } = req.body;

  if (!usuarioId || !filmeId || !comentario || !comentario.trim()) {
    return res.status(400).json({ erro: "Comentário não pode ser vazio." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO avaliacoes (usuario_id, filme_id, comentario)
       VALUES ($1, $2, $3)
       RETURNING id, comentario, data_avaliacao`,
      [usuarioId, filmeId, comentario.trim()],
    );

    const usuario = await pool.query(
      "SELECT nome FROM usuarios WHERE id = $1",
      [usuarioId],
    );

    res.status(201).json({ ...result.rows[0], nome: usuario.rows[0].nome });
  } catch (erro) {
    console.error("Erro ao salvar comentário:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Edita um comentário (só o dono pode)
app.put("/comentarios/:id", async (req, res) => {
  const { id } = req.params;
  const { usuarioId, comentario } = req.body;

  if (!comentario || !comentario.trim()) {
    return res.status(400).json({ erro: "Comentário não pode ser vazio." });
  }

  try {
    const result = await pool.query(
      `UPDATE avaliacoes
       SET comentario = $1
       WHERE id = $2 AND usuario_id = $3
       RETURNING id, comentario, data_avaliacao`,
      [comentario.trim(), id, usuarioId],
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ erro: "Você não pode editar esse comentário." });
    }

    res.json(result.rows[0]);
  } catch (erro) {
    console.error("Erro ao editar comentário:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Exclui um comentário (só o dono pode)
app.delete("/comentarios/:id", async (req, res) => {
  const { id } = req.params;
  const { usuarioId } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM avaliacoes WHERE id = $1 AND usuario_id = $2 RETURNING id`,
      [id, usuarioId],
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ erro: "Você não pode excluir esse comentário." });
    }

    res.json({ mensagem: "Comentário excluído." });
  } catch (erro) {
    console.error("Erro ao excluir comentário:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Verifica se o e-mail existe (etapa 1 do "Esqueceu Senha")
app.post("/verificar-email", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Não encontramos uma conta com esse e-mail." });
    }

    res.json({ mensagem: "E-mail encontrado." });
  } catch (erro) {
    console.error("Erro ao verificar e-mail:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Redefine a senha (etapa 2 do "Esqueceu Senha")
app.post("/redefinir-senha", async (req, res) => {
  const { email, novaSenha } = req.body;

  if (!novaSenha || novaSenha.length < 8) {
    return res.status(400).json({ erro: "A senha precisa ter pelo menos 8 caracteres." });
  }

  try {
    const usuarioExistente = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);

    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const saltRounds = 10;
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

    await pool.query("UPDATE usuarios SET senha_hash = $1 WHERE email = $2", [
      novaSenhaHash,
      email,
    ]);

    res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.listen(3000, () => console.log("Backend rodando na porta 3000"));
