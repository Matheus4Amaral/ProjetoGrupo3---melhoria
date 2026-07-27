const { z } = require("zod");

const idSchema = z.coerce
  .number({ error: "Identificador inválido." })
  .int("O identificador precisa ser um número inteiro.")
  .positive("O identificador precisa ser positivo.");

const nomeSchema = z
  .string({ error: "Informe seu nome completo." })
  .trim()
  .min(3, "O nome precisa ter pelo menos 3 caracteres.")
  .max(100, "O nome pode ter no máximo 100 caracteres.")
  .regex(
    /^[\p{L}\p{M} .'-]+$/u,
    "O nome contém caracteres que não são permitidos.",
  );

const emailSchema = z
  .string({ error: "Informe seu e-mail." })
  .trim()
  .min(1, "Informe seu e-mail.")
  .max(100, "O e-mail pode ter no máximo 100 caracteres.")
  .email("Informe um e-mail válido.")
  .toLowerCase();

const senhaSchema = z
  .string({ error: "Informe uma senha." })
  .min(6, "A senha precisa ter pelo menos 6 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.")
  .regex(/\p{L}/u, "A senha precisa conter pelo menos uma letra.")
  .regex(/\d/, "A senha precisa conter pelo menos um número.");

const senhaLoginSchema = z
  .string({ error: "Informe sua senha." })
  .min(1, "Informe sua senha.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");

const comentarioSchema = z
  .string({ error: "Escreva um comentário." })
  .trim()
  .min(1, "O comentário não pode estar vazio.")
  .max(1000, "O comentário pode ter no máximo 1.000 caracteres.");

const cadastroSchema = z.object({
  name: nomeSchema,
  email: emailSchema,
  password: senhaSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: senhaLoginSchema,
});

const emailBodySchema = z.object({
  email: emailSchema,
});

const redefinirSenhaSchema = z.object({
  email: emailSchema,
  novaSenha: senhaSchema,
});

const filmeIdParamsSchema = z.object({
  filmeId: idSchema,
});

const comentarioCriarSchema = z.object({
  usuarioId: idSchema,
  filmeId: idSchema,
  comentario: comentarioSchema,
});

const comentarioEditarSchema = z.object({
  id: idSchema,
  usuarioId: idSchema,
  comentario: comentarioSchema,
});

const comentarioExcluirSchema = z.object({
  id: idSchema,
  usuarioId: idSchema,
});

function validarDados(schema, dados, res) {
  const resultado = schema.safeParse(dados);

  if (resultado.success) {
    return resultado.data;
  }

  const campos = resultado.error.issues.reduce((erros, issue) => {
    const campo = issue.path[0];

    if (campo && !erros[campo]) {
      erros[campo] = issue.message;
    }

    return erros;
  }, {});

  res.status(400).json({
    erro: resultado.error.issues[0]?.message || "Dados inválidos.",
    campos,
  });

  return null;
}

module.exports = {
  cadastroSchema,
  comentarioCriarSchema,
  comentarioEditarSchema,
  comentarioExcluirSchema,
  emailBodySchema,
  filmeIdParamsSchema,
  loginSchema,
  redefinirSenhaSchema,
  validarDados,
};
