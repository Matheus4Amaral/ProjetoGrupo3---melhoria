import { z } from "zod";

export const nomeSchema = z
  .string({ error: "Informe seu nome completo." })
  .trim()
  .min(3, "O nome precisa ter pelo menos 3 caracteres.")
  .max(100, "O nome pode ter no máximo 100 caracteres.")
  .regex(
    /^[\p{L}\p{M} .'-]+$/u,
    "O nome contém caracteres que não são permitidos.",
  );

export const emailSchema = z
  .string({ error: "Informe seu e-mail." })
  .trim()
  .min(1, "Informe seu e-mail.")
  .max(100, "O e-mail pode ter no máximo 100 caracteres.")
  .email("Informe um e-mail válido.")
  .toLowerCase();

export const senhaSchema = z
  .string({ error: "Informe uma senha." })
  .min(6, "A senha precisa ter pelo menos 6 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.")
  .regex(/\p{L}/u, "A senha precisa conter pelo menos uma letra.")
  .regex(/\d/, "A senha precisa conter pelo menos um número.");

const senhaLoginSchema = z
  .string({ error: "Informe sua senha." })
  .min(1, "Informe sua senha.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");

export const cadastroSchema = z
  .object({
    name: nomeSchema,
    email: emailSchema,
    password: senhaSchema,
    confirmPassword: z.string({ error: "Confirme sua senha." }),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: senhaLoginSchema,
});

export const redefinirSenhaSchema = z
  .object({
    email: emailSchema,
    novaSenha: senhaSchema,
    confirmarSenha: z.string({ error: "Confirme sua nova senha." }),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export const comentarioSchema = z
  .string({ error: "Escreva um comentário." })
  .trim()
  .min(1, "O comentário não pode estar vazio.")
  .max(1000, "O comentário pode ter no máximo 1.000 caracteres.");

export function obterErrosPorCampo(erroZod) {
  return erroZod.issues.reduce((erros, issue) => {
    const campo = issue.path[0];

    if (campo && !erros[campo]) {
      erros[campo] = issue.message;
    }

    return erros;
  }, {});
}
