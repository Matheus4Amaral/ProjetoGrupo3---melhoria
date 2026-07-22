# FlashView 🎬

Um organizador pessoal de filmes e séries desenvolvido para ajudar você a descobrir, salvar e comentar sobre suas obras favoritas. O projeto consome a API do TMDB para exibir catálogos atualizados e utiliza um back-end próprio para gerenciar usuários, listas pessoais e interações.

---

## Tecnologias Utilizadas

O projeto foi construído utilizando a seguinte stack:

**Front-end:**
* **React** (com Vite)
* **React Router Dom** (para navegação)
* **CSS Modules** (para estilização componentizada)

**Back-end:**
* **Node.js** com **Express**
* **PostgreSQL** (com a biblioteca `pg`)
* **Bcrypt** (para hash de senhas)

**APIs Externas:**
* **TMDB API** (The Movie Database) para dados de filmes, sinopses, imagens e gêneros.

---

## Funcionalidades Principais

* **Exploração de Catálogo:** Busca de filmes por título e filtro por categorias/gêneros.
* **Autenticação de Usuário:** Sistema de cadastro e login com senhas criptografadas (Bcrypt).
* **Minha Lista:** Adicione e remova filmes da sua lista de interesses diretamente da página de detalhes ou do catálogo. A lista é vinculada de forma segura ao seu usuário no banco de dados.
* **Sistema de Comentários:** 
  * Usuários logados podem deixar comentários em qualquer filme.
  * Os comentários são públicos, mas as ações de **Editar** e **Excluir** são restritas apenas ao dono do comentário (validação direta via query SQL).

---

## Como rodar o projeto localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/johnatanduarte/organizador-de-filmes-e-series.git
cd organizador-de-filmes-e-series
```

### 2. Configurar o Banco de Dados (PostgreSQL)
Crie um banco de dados chamado com o nome da sua preferência e rode os seguintes scripts SQL para criar as tabelas necessárias:

```sql
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
```

### 3. Configurar Variáveis de Ambiente
Você precisará criar dois arquivos `.env` separados.

**No diretório do Front-end (`frontend`):**
Crie um arquivo `.env` na raiz da pasta `frontend` e adicione sua chave da API do TMDB:
```env
VITE_TMDB_API_KEY=sua_chave_aqui
```

**No diretório do Back-end (`backend`):**
Crie um arquivo `.env` na raiz da pasta `backend` para configurar a conexão com o banco:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=nome_do_seu_banco
DB_PASS=sua_senha_aqui
DB_PORT=5432
```

### 4. Iniciando os Servidores

O projeto é dividido em duas pastas. Você precisará rodar cada uma em um terminal separado.

**Para iniciar o Front-end:**
Abra um terminal na raiz do projeto, acesse a pasta do front-end, instale as dependências e inicie o Vite:
```bash
cd frontend
npm install
npm run dev
```

**Para iniciar o Back-end:**
Abra um segundo terminal na raiz do projeto, acesse a pasta do back-end, instale as dependências e inicie o servidor Node:
```bash
cd backend
npm install
node server.js
```

---

## Avisos de API
*Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.*
