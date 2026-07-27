const express = require("express"); // Importa a biblioteca do Express para criar o servidor
const cors = require("cors"); // Importa a biblioteca para lidar com requisições HTTP
const { Pool } = require("pg"); // Importa a biblioteca do PostgreSQL
const bcrypt = require("bcrypt"); // Importa a biblioteca de criptografia
const nodemailer = require("nodemailer"); // Importa a biblioteca de envio de e-mails
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

// Configuração do envio de e-mails (usado no "Esqueceu a senha")
const transporter = nodemailer.createTransport({
  service: "gmail", // Se não usar Gmail, troque por host/port do seu provedor
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Guarda os códigos de recuperação em memória: { email: { codigo, expiraEm } }
// Simples e suficiente para o projeto. Se o servidor reiniciar, os
// códigos pendentes se perdem (o que é aceitável nesse caso).
const codigosRecuperacao = {};

// Regra de senha forte: mínimo 8 caracteres, pelo menos 1 número e
// pelo menos 1 caractere especial.
const REGEX_SENHA_FORTE = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/;
function senhaEhForte(senha) {
  return !!senha && REGEX_SENHA_FORTE.test(senha);
}

// Rota de Cadastro
app.post("/cadastro", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 0. Valida a força da senha antes de qualquer outra coisa
    if (!senhaEhForte(password)) {
      return res.status(400).json({
        erro: "A senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 caractere especial.",
      });
    }

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

// Etapa 1: recebe o e-mail, gera um código de 6 dígitos e envia por e-mail
app.post("/verificar-email", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ erro: "Não encontramos uma conta com esse e-mail." });
    }

    // Gera um código de 6 dígitos (000000 a 999999)
    const codigo = String(Math.floor(100000 + Math.random() * 900000));

    // Guarda o código com validade de 15 minutos
    codigosRecuperacao[email] = {
      codigo,
      expiraEm: Date.now() + 15 * 60 * 1000, // 15 minutos
    };

    await transporter.sendMail({
      from: `"FlashView" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de recuperação de senha - FlashView",
      html: `<p>Você solicitou a redefinição da sua senha. Seu código é: <strong>${codigo}</strong></p>`,
    });

    res.json({ mensagem: "Código enviado para o seu e-mail." });
  } catch (erro) {
    console.error("Erro ao verificar e-mail:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Etapa 2: recebe o código digitado e confirma se bate com o gerado
app.post("/verificar-codigo", async (req, res) => {
  const { email, codigo } = req.body;

  const registro = codigosRecuperacao[email];

  if (!registro) {
    return res
      .status(400)
      .json({ erro: "Solicite um novo código antes de continuar." });
  }

  if (Date.now() > registro.expiraEm) {
    delete codigosRecuperacao[email];
    return res
      .status(400)
      .json({ erro: "Esse código expirou. Solicite um novo." });
  }

  if (registro.codigo !== codigo) {
    return res.status(400).json({ erro: "Código inválido." });
  }

  // Marca o código como validado para liberar a troca de senha
  registro.validado = true;

  res.json({ mensagem: "Código validado com sucesso." });
});

// Etapa 3: redefine a senha (só permite se o código já foi validado)
app.post("/redefinir-senha", async (req, res) => {
  const { email, novaSenha } = req.body;

  const registro = codigosRecuperacao[email];

  if (!registro || !registro.validado) {
    return res
      .status(400)
      .json({ erro: "Você precisa validar o código antes de redefinir a senha." });
  }

  if (!senhaEhForte(novaSenha)) {
    return res.status(400).json({
      erro: "A senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 caractere especial.",
    });
  }

  try {
    // A verificação de existência do usuário já foi feita na etapa 1

    const saltRounds = 10;
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

    await pool.query("UPDATE usuarios SET senha_hash = $1 WHERE email = $2", [
      novaSenhaHash,
      email,
    ]);

    // Código usado, remove da memória
    delete codigosRecuperacao[email];

    res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// ========== MINHA LISTA / ASSISTIDOS (tabela interacoes) ==========

//rota para obter a lista de filmes/séries salvos pelo usuário
app.get("/interacoes/lista/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query(
      `SELECT filme_id, tipo FROM interacoes
       WHERE usuario_id = $1 AND esta_na_lista = true
       ORDER BY id DESC`,
      [usuarioId],
    );
    res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao buscar lista:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

//rota para obter a lista de filmes/séries assistidos pelo usuário
app.get("/interacoes/assistidos/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query(
      `SELECT filme_id, tipo FROM interacoes
       WHERE usuario_id = $1 AND assistido = true
       ORDER BY id DESC`,
      [usuarioId],
    );
    res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao buscar assistidos:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

//rota para verificar se um filme/série está na lista ou foi assistido
app.get("/interacoes/status/:usuarioId/:filmeId/:tipo", async (req, res) => {
  const { usuarioId, filmeId, tipo } = req.params;
  try {
    const result = await pool.query(
      `SELECT esta_na_lista, assistido FROM interacoes
       WHERE usuario_id = $1 AND filme_id = $2 AND tipo = $3`,
      [usuarioId, filmeId, tipo],
    );
    const linha = result.rows[0];
    res.json({
      naLista: linha?.esta_na_lista ?? false,
      assistido: linha?.assistido ?? false,
    });
  } catch (erro) {
    console.error("Erro ao buscar status:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// rota para adicionar um filme/série à lista do usuário (ou marcar como assistido)
app.post("/interacoes/lista/adicionar", async (req, res) => {
  const { usuarioId, filmeId, tipo } = req.body;
  if (!usuarioId || !filmeId) {
    return res.status(400).json({ erro: "Dados incompletos." });
  }
  try {
    await pool.query(
      `INSERT INTO interacoes (usuario_id, filme_id, tipo, esta_na_lista)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (usuario_id, filme_id, tipo)
       DO UPDATE SET esta_na_lista = true`,
      [usuarioId, filmeId, tipo || "movie"],
    );
    res.json({ mensagem: "Adicionado à lista." });
  } catch (erro) {
    console.error("Erro ao adicionar à lista:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// rota para remover um filme/série da lista do usuário (ou desmarcar como assistido)
app.post("/interacoes/lista/remover", async (req, res) => {
  const { usuarioId, filmeId, tipo } = req.body;
  try {
    await pool.query(
      `UPDATE interacoes SET esta_na_lista = false
       WHERE usuario_id = $1 AND filme_id = $2 AND tipo = $3`,
      [usuarioId, filmeId, tipo || "movie"],
    );
    res.json({ mensagem: "Removido da lista." });
  } catch (erro) {
    console.error("Erro ao remover da lista:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

//rota para marcar um filme/série como assistido
app.post("/interacoes/assistido/adicionar", async (req, res) => {
  const { usuarioId, filmeId, tipo } = req.body;
  if (!usuarioId || !filmeId) {
    return res.status(400).json({ erro: "Dados incompletos." });
  }
  try {
    await pool.query(
      `INSERT INTO interacoes (usuario_id, filme_id, tipo, assistido)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (usuario_id, filme_id, tipo)
       DO UPDATE SET assistido = true`,
      [usuarioId, filmeId, tipo || "movie"],
    );
    res.json({ mensagem: "Marcado como assistido." });
  } catch (erro) {
    console.error("Erro ao marcar como assistido:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

//rota para desmarcar um filme/série como assistido
app.post("/interacoes/assistido/remover", async (req, res) => {
  const { usuarioId, filmeId, tipo } = req.body;
  try {
    await pool.query(
      `UPDATE interacoes SET assistido = false
       WHERE usuario_id = $1 AND filme_id = $2 AND tipo = $3`,
      [usuarioId, filmeId, tipo || "movie"],
    );
    res.json({ mensagem: "Desmarcado como assistido." });
  } catch (erro) {
    console.error("Erro ao desmarcar assistido:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// ========== ATUALIZAR PERFIL (nome e/ou senha) ==========

// Atualiza o nome e/ou a senha do usuário logado.
// Pra trocar a senha, é obrigatório informar a senha atual (senhaAtual).
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, senhaAtual, novaSenha } = req.body;

  try {
    const usuarioResult = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [id],
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuario = usuarioResult.rows[0];

    // Se o nome foi enviado, precisa ter conteúdo de verdade
    if (nome !== undefined && !nome.trim()) {
      return res.status(400).json({ erro: "O nome não pode ficar vazio." });
    }

    let novaSenhaHash = usuario.senha_hash;

    // Só mexe na senha se o usuário realmente pediu pra trocar
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({
          erro: "Informe sua senha atual para definir uma nova senha.",
        });
      }

      const senhaAtualValida = await bcrypt.compare(
        senhaAtual,
        usuario.senha_hash,
      );
      if (!senhaAtualValida) {
        return res.status(401).json({ erro: "Senha atual incorreta." });
      }

      if (!senhaEhForte(novaSenha)) {
        return res.status(400).json({
          erro: "A nova senha precisa ter no mínimo 8 caracteres, incluindo 1 número e 1 caractere especial.",
        });
      }

      novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    }

    const novoNome = nome !== undefined ? nome.trim() : usuario.nome;

    await pool.query(
      "UPDATE usuarios SET nome = $1, senha_hash = $2 WHERE id = $3",
      [novoNome, novaSenhaHash, id],
    );

    res.json({
      mensagem: "Dados atualizados com sucesso!",
      usuarioNome: novoNome,
    });
  } catch (erro) {
    console.error("Erro ao atualizar usuário:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.listen(3000, () => console.log("Backend rodando na porta 3000"));