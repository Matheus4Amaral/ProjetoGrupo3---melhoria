CREATE SCHEMA IF NOT EXISTS flashview;
SET search_path TO flashview;

-- 1. Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL
);

-- 2. Interações (Minha Lista)
CREATE TABLE interacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    filme_id INTEGER NOT NULL,
    esta_na_lista BOOLEAN DEFAULT TRUE,
    UNIQUE(usuario_id, filme_id)
);

-- 3. Avaliações (Comentários)
CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    filme_id INTEGER NOT NULL,
    nota DECIMAL(2, 1) CHECK (nota >= 0 AND nota <= 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);