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
Crie um banco de dados chamado com o nome da sua preferência e rode os seguintes scripts SQL para criar as tabelas necessárias.:

```bash
psql -U postgres -f backend/migration.sql
```

### 3. Configurar Variáveis de Ambiente
Você precisará criar dois arquivos `.env` separados.

**No diretório do Front-end (`frontend`):**
Crie um arquivo `.env` na raiz da pasta `frontend` a partir do arquivo `.env.example` e adicione sua chave da API do TMDB

**No diretório do Back-end (`backend`):**
Crie um arquivo `.env` na raiz da pasta `backend` a partir do arquivo `.env.example` para configurar a conexão com o banco

### 4. Iniciando os Servidores

Antes de iniciar os servidores, voce precisará instalar as dependências.

**Para instalar dependências no Front-end:**
Abra um terminal na raiz do projeto, acesse a pasta do front-end, instale as dependências:
```bash
cd frontend
npm install
```

**Para instalar dependências no Back-end:**
Abra um terminal na raiz do projeto, acesse a pasta do back-end, instale as dependências:
```bash
cd backend
npm install
```

**Para rodar ambos os servidores**
O projeto é dividido em duas pastas. Você pode rodar ambas as pastas na pasta raiz do projeto com:
```bash
npm run dev
```

**Para rodar separadamente os servidores**
Para rodar cada um separadamente, na pasta raiz do projeto, você pode rodar o seguinte comando:
```bash
npm run dev --prefix frontend
```
ou
```bash
npm run dev --prefix backend
```
---

## Avisos de API
*Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.*
