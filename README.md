# NexTech Informática

Loja de informática completa: catálogo em MySQL, API Node.js/Express com autenticação JWT e
front-end responsivo com carrinho, montador de PC e área do cliente.

> **Slogan:** Seu próximo upgrade começa aqui.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar](#como-rodar)
- [Configuração do `.env`](#configuração-do-env)
- [Banco de dados](#banco-de-dados)
- [API](#api)
- [Front-end](#front-end)
- [Testes](#testes)
- [Scripts disponíveis](#scripts-disponíveis)

---

## Funcionalidades

### Catálogo
- 50 produtos cadastrados diretamente no MySQL, em 14 categorias:
  processadores, placas de vídeo, placas-mãe, memórias, armazenamento, fontes, gabinetes,
  coolers, monitores, periféricos, notebooks, smartphones, PCs prontos e serviços.
- PCs para **escritório, intermediário, gamer e lazer**, além de celulares, periféricos e
  serviços de instalação/manutenção do Windows.
- Busca por nome, filtro por categoria e faixa de preço, ordenação e paginação.
- **10 produtos por página** — `pagina=1` devolve os itens 1 a 10, `pagina=2` os itens 11 a 20,
  e assim por diante (5 páginas com 50 produtos).
- Ordenação por menor preço, maior preço, nome A–Z/Z–A, melhor avaliados, destaques e novidades.
- Página de detalhe com descrição, especificações, estoque, parcelamento e produtos relacionados.
- Imagens dos produtos entregues pelo servidor em `GET /produtos/:id/imagem`, com suporte a
  arquivos no Google Drive e fallback local fora do repositório.

### Conta e compra
- Cadastro com validação de nome, CPF, celular, email e senha.
- Senhas armazenadas com **bcrypt** (nunca em texto puro).
- Login com **JWT** (validade de 7 dias) e rotas protegidas.
- `localStorage` guarda `nome_cliente`, `email_cliente` e `token` após o login.
- Cabeçalho mostra o usuário logado (nome, email e avatar) e sincroniza a sessão com
  `GET /cliente/perfil`, inclusive para sessões antigas que tinham apenas o token.
- Usuário cadastrado entra com o **mesmo email e senha** informados no cadastro.
- Carrinho persistido no navegador com `localStorage`, com quantidade, remoção, cupom e frete.
- Prévia do carrinho no cabeçalho lista os produtos, quantidades, subtotal e atalho de compra.
- Na página do carrinho, os itens são sincronizados com o catálogo (nome, preço, imagem e estoque).
- Checkout exige login: sem sessão, o site abre um aviso para entrar ou criar conta.
- Checkout em etapas: dados de entrega, forma de pagamento (PIX, cartão ou boleto) e resumo do pedido.
- Compra registrada no MySQL por `POST /compras`, com vários produtos e baixa de estoque.
- Página "Minha conta" com dados do cliente (via `GET /cliente/perfil`) e histórico de compras
  (via `GET /compras`).
- Monte seu PC com presets, seleção de componentes, serviços opcionais e total em tempo real.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express 5 |
| Banco | MySQL 8.4 (`mysql2/promise`) |
| Autenticação | JSON Web Token (`jsonwebtoken`) + `bcrypt` |
| Front-end | HTML5, CSS3, JavaScript puro e Bootstrap 5.3 |
| Testes | `node:test` (test runner nativo do Node.js) |

---

## Estrutura do projeto

```
projeto_final/
├── app.js                  # configuração do Express
├── index.js                # inicialização do servidor
├── db.js                   # pool de conexões MySQL via .env
├── migration.js            # cria tabelas e carrega o catálogo
├── data/produtos.js        # fonte única dos 50 produtos
├── data/imagens-drive.js   # mapa arquivo -> ID no Google Drive
├── imagens-produtos/       # imagens dos produtos (SVGs + PNGs p/ Drive)
├── src/
│   ├── produtos.js         # catálogo + rota de imagens
│   ├── clientes.js         # cadastro, login e perfil
│   ├── compras.js          # registro e histórico de compras
│   ├── validacao.js        # validação dos filtros + SQL parametrizado
│   ├── validacao-compras.js# validação dos itens e totais
│   └── auth.js             # middleware do JWT
├── scripts/
│   ├── criar-banco.js      # cria o banco se não existir
│   ├── testar-banco.js     # diagnóstico do banco (npm run db:test)
│   ├── gerar-imagens.js    # gera os SVGs na pasta externa
│   └── gerar-sql.js        # gera o produto.sql
├── tests/
│   ├── validacao.test.js   # testes unitários dos filtros
│   ├── api.test.js         # testes de integração da API
│   └── site.test.js        # testes estáticos do front-end
├── site/
│   ├── index.html          # home
│   ├── produtos.html       # catálogo
│   ├── produto.html        # detalhe
│   ├── carrinho.html       # carrinho
│   ├── monte-seu-pc.html   # montador
│   ├── login.html
│   ├── cadastro.html
│   ├── perfil.html
│   ├── css/style.css
│   ├── js/                 # api, ui, layout, presets e scripts de cada página
│   ├── vendor/             # Bootstrap 5.3 e Bootstrap Icons locais
│   └── assets/img/         # logo, favicon e placeholder de imagem
├── produto.sql             # catálogo em SQL (para Workbench)
├── cliente.sql             # estrutura da tabela de clientes
├── compra.sql              # estrutura das tabelas de compras
├── modelo_cliente.json     # exemplo de corpo para POST /cliente
├── modelo_compra.json      # exemplo de corpo para POST /compras
├── dotenv-example.txt      # modelo do arquivo .env
└── package.json
```

---

## Como rodar

### Pré-requisitos
- Node.js 20 ou superior
- MySQL 8.x em execução

### Passo a passo

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de configuração
#    Copie dotenv-example.txt para .env e ajuste usuário/senha do MySQL
copy dotenv-example.txt .env      # Windows
# cp dotenv-example.txt .env      # Linux/macOS

# 3. Criar o banco (opcional: a migration também cria)
npm run db:create

# 4. Criar as tabelas e carregar os 50 produtos + cliente demo
npm run migrate

# 5. Subir a API e o site
npm start
```

Acesse **http://localhost:3000**.

> **Importante:** abra sempre por `http://localhost:3000`, e não dando dois cliques no
> arquivo HTML nem por um servidor de prévia (Live Server, porta 5500, etc.). O login e o
> carrinho ficam no `localStorage`, que é separado por endereço: em `file://` ou em outra
> porta o navegador usa outro "cofre" e parece que você saiu da conta e o carrinho esvaziou.
> Se o site for aberto como arquivo ou em outra porta local e o servidor estiver no ar, ele
> redireciona automaticamente para `http://localhost:3000`.

Para recriar o banco do zero (apaga as tabelas e recarrega tudo):

```bash
npm run migrate:reset
```

### Login de demonstração

| Email | Senha |
|---|---|
| `demo@nextech.com` | `demo1234` |

### Se algum comando falhar

Os scripts mostram a dica do erro. Os casos mais comuns:

| Mensagem | Causa | Solução |
|---|---|---|
| `Access denied for user ...` | usuário/senha do MySQL errados no `.env` | ajuste `DB_USER`/`DB_PASSWORD`; se o root usa autenticação do sistema (auth_socket), crie um usuário próprio (veja abaixo) |
| `ECONNREFUSED` | MySQL parado ou em outra porta | inicie o serviço e confira `DB_HOST`/`DB_PORT` |
| `Table 'produto' doesn't exist` | banco existe, mas sem tabelas | `npm run migrate` |
| `Unknown database` | banco ainda não criado | `npm run db:create` |

Criando um usuário do projeto no MySQL (rode como root do MySQL):

```sql
CREATE USER 'nextech'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON nextech.* TO 'nextech'@'localhost';
FLUSH PRIVILEGES;
```

E no `.env`:

```env
DB_USER=nextech
DB_PASSWORD=sua_senha
```

Para conferir se tudo está no lugar, rode `npm run db:test`.

---

## Configuração do `.env`

```env
API_PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_DATABASE=nextech

JWT_SECRET=uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=7d

# Imagens: pasta externa e Google Drive
IMAGENS_DIR=imagens-produtos
GOOGLE_DRIVE_FOLDER_ID=ID_DA_PASTA_NO_DRIVE
GOOGLE_DRIVE_API_KEY=chave_de_api_do_google_drive
GOOGLE_DRIVE_IMAGE_SIZE=w1200
GOOGLE_DRIVE_TIMEOUT_MS=8000
```

> A `GOOGLE_DRIVE_API_KEY` é opcional, porém recomendada: o Google descontinuou o
> `embeddedfolderview` usado como alternativa, e ele pode devolver a pasta vazia.

Gere uma chave segura com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> O arquivo `.env` está no `.gitignore` e não deve ser versionado.

---

## Banco de dados

### Tabelas

**`cliente`**

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INT | chave primária |
| `nome` | VARCHAR(100) | obrigatório |
| `cpf` | CHAR(14) | único, formato `000.000.000-00` |
| `celular` | CHAR(14) | formato `(00)00000-0000` |
| `email` | VARCHAR(100) | único |
| `senha` | VARCHAR(512) | hash bcrypt |

**`produto`**

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INT | chave primária |
| `nome` | VARCHAR(200) | |
| `descricao` | TEXT | |
| `categoria` | VARCHAR(50) | indexada |
| `marca` | VARCHAR(60) | |
| `preco` | DECIMAL(10,2) | indexado |
| `preco_antigo` | DECIMAL(10,2) | pode ser nulo |
| `estoque` | INT | |
| `destaque` | TINYINT(1) | indexado |
| `caminho_img` | VARCHAR(255) | nome/base do arquivo de imagem |
| `imagem_drive_id` | VARCHAR(100) | ID do arquivo no Google Drive (opcional) |
| `quantidade_img` | INT | |
| `avaliacao` | DECIMAL(2,1) | |
| `avaliacoes` | INT | |

**`compra`**

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INT | chave primária |
| `cliente_id` | INT | FK para `cliente` |
| `codigo` | VARCHAR(30) | código único do pedido |
| `subtotal` | DECIMAL(10,2) | soma dos itens |
| `desconto` | DECIMAL(10,2) | cupom aplicado |
| `frete` | DECIMAL(10,2) | frete calculado no servidor |
| `total` | DECIMAL(10,2) | valor final |
| `data_compra` | DATETIME | data/hora do registro |

**`compra_item`**

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INT | chave primária |
| `compra_id` | INT | FK para `compra` |
| `produto_id` | INT | FK para `produto` |
| `nome_produto` | VARCHAR(200) | nome no momento da compra |
| `quantidade` | INT | quantidade comprada |
| `preco_unitario` | DECIMAL(10,2) | preço no momento da compra |
| `subtotal` | DECIMAL(10,2) | preço × quantidade |

### Scripts SQL

- `produto.sql` — recria a tabela `produto` e insere os 50 itens (gerado por `npm run sql`).
- `cliente.sql` — cria a tabela `cliente`.
- `compra.sql` — cria as tabelas `compra` e `compra_item`.

Ambos podem ser executados no MySQL Workbench. O `migration.js` faz o mesmo de forma
automática e idempotente.

### MySQL portátil (usado neste ambiente)

Neste computador o MySQL 8.4.9 foi instalado em modo portátil, sem serviço do Windows:

```powershell
$base = "C:\Users\Public\mysql-nextech\mysql-8.4.9-winx64"

# iniciar o servidor
& "$base\bin\mysqld.exe" `
  --basedir="$base" `
  --datadir="C:\Users\Public\mysql-nextech\data" `
  --port=3306 `
  --bind-address=127.0.0.1 `
  --log-error="C:\Users\Public\mysql-nextech\mysql-error.log"

# conferir se está no ar
Test-NetConnection 127.0.0.1 -Port 3306
```

Credenciais locais usadas no `.env`: usuário `root`, banco `nextech`.
A senha do root está definida no arquivo `.env` (não versionado).

Se você usa o MySQL instalado como serviço, basta iniciá-lo pelo serviço do Windows e
apontar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_DATABASE` no `.env`.

---

## API

Base: `http://localhost:3000`

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/cliente` | Cadastra um cliente |
| `POST` | `/login` | Autentica e devolve o JWT |
| `GET` | `/cliente/perfil` | Dados do cliente autenticado |

**POST /cliente**

```json
{
  "nome": "Cliente Exemplo",
  "cpf": "123.456.789-09",
  "celular": "(42)99999-0000",
  "email": "cliente@exemplo.com",
  "senha": "senha123"
}
```

- `201` — `{ "msg": "Cliente cadastrado com sucesso", "id": 2 }`
- `400` — dados inválidos
- `409` — email ou CPF já cadastrado

**POST /login**

```json
{ "email": "demo@nextech.com", "senha": "demo1234" }
```

- `200` — `{ "nome": "Cliente Demo", "email": "...", "token": "..." }`
- `401` — email ou senha inválidos

**GET /cliente/perfil**

Envie o cabeçalho `Authorization: Bearer <token>`.

- `200` — `{ "id", "nome", "cpf", "celular", "email" }`
- `401` — token não enviado
- `403` — token inválido ou expirado

### Compras

Todas as rotas de compras exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/compras` | Registra uma compra com um ou vários produtos |
| `GET` | `/compras` | Lista as compras do cliente autenticado |
| `GET` | `/compras/:id` | Detalhe de uma compra do próprio cliente |

**POST /compras**

```json
{
  "itens": [
    { "produto_id": 1, "quantidade": 2 },
    { "produto_id": 12, "quantidade": 1 }
  ],
  "cupom": "NEXTECH10"
}
```

- `201` — `{ "msg": "...", "compra": { "id", "codigo", "subtotal", "desconto", "frete", "total", "itens" } }`
- `400` — itens ou cupom inválidos
- `401` / `403` — token ausente, inválido ou expirado
- `404` — produto inexistente
- `409` — estoque insuficiente

O servidor recalcula todos os valores, aplica o cupom `NEXTECH10` (10%) e o frete grátis
acima de R$ 299. O estoque é baixado dentro da mesma transação.

**GET /compras**

```json
{
  "total": 1,
  "compras": [
    {
      "id": 1,
      "codigo": "NX...",
      "data_compra": "...",
      "subtotal": 1899.80,
      "desconto": 189.98,
      "frete": 0,
      "total": 1709.82,
      "itens": [
        { "produto_id": 1, "nome": "...", "quantidade": 2, "preco_unitario": 899.90, "subtotal": 1799.80 }
      ]
    }
  ]
}
```

### Imagens

`GET /produtos/:id/imagem` entrega a imagem pelo servidor, com `Cache-Control` de 24 horas.
A origem é escolhida nesta ordem:

1. ID do arquivo no Google Drive (`produto.imagem_drive_id`);
2. arquivo local em `IMAGENS_DIR` (fora do repositório);
3. placeholder `site/assets/img/produto-placeholder.svg`.

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/produtos` | Lista paginada com filtros |
| `GET` | `/produtos/:id` | Produto específico |
| `GET` | `/produtos/categorias` | Categorias com contagem |
| `GET` | `/produtos/filtros` | Faixa de preço + categorias |
| `GET` | `/produtos/destaques` | Produtos em destaque |
| `GET` | `/produtos/todos` | Catálogo completo em array |

O alias `/produto` responde exatamente como `/produtos`.

**Parâmetros de `GET /produtos`**

| Parâmetro | Exemplo | Descrição |
|---|---|---|
| `nome` | `Ryzen` | Busca por trecho do nome |
| `categoria` | `Processadores` | Aceita singular/plural (`processador`) |
| `preco_min` | `200` | Preço mínimo |
| `preco_max` | `700` | Preço máximo |
| `ordem` | `menor_preco` | Veja a lista abaixo |
| `pagina` | `2` | Página (10 itens por página) |

Ordenações aceitas: `relevancia`, `destaques`, `menor_preco`, `maior_preco`, `nome_az`,
`nome_za`, `avaliacao`, `novidades`.

**Exemplo**

```
GET /produtos?categoria=processador&preco_min=200&preco_max=700&ordem=menor_preco&pagina=1
```

```json
{
  "pagina": 1,
  "por_pagina": 10,
  "total": 1,
  "total_paginas": 1,
  "tem_anterior": false,
  "tem_proxima": false,
  "produtos": [
    {
      "id": 2,
      "nome": "Processador AMD Athlon 3000G 3.5GHz",
      "categoria": "Processadores",
      "marca": "AMD",
      "preco": 329.9,
      "estoque": 18,
      "imagem_url": "/produtos/2/imagem",
      "avaliacao": 4.4,
      "avaliacoes": 160
    }
  ]
}
```

### Diagnóstico

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status da API e do banco |

---

## Front-end

O Express serve a pasta `site/` na raiz (`http://localhost:3000`).

| Página | URL | Conteúdo |
|---|---|---|
| Home | `/index.html` | Hero, categorias, destaques, presets, serviços |
| Catálogo | `/produtos.html` | Busca, filtros, ordenação e paginação |
| Detalhe | `/produto.html?id=1` | Produto, especificações e relacionados |
| Carrinho | `/carrinho.html` | Itens, cupom, frete e checkout |
| Monte seu PC | `/monte-seu-pc.html` | Presets e montagem peça por peça |
| Login | `/login.html` | Autenticação |
| Cadastro | `/cadastro.html` | Criação de conta |
| Perfil | `/perfil.html` | Dados do cliente e pedidos |

Detalhes de implementação:

- `site/js/api.js` centraliza as chamadas HTTP e a sessão (`localStorage`).
- `site/js/ui.js` contém cards, preços, estrelas, toasts e funções do carrinho.
- `site/js/layout.js` injeta cabeçalho, rodapé e estado de login em todas as páginas.
- O carrinho usa a chave `nextech_carrinho` no `localStorage`.
- O carrinho aceita dados de versões antigas (`produto_id`, `quantidade`, `preco_unitario`) e, se o
  navegador bloquear o `localStorage`, usa `sessionStorage`/memória e avisa o usuário.
- Os pedidos são registrados no MySQL e consultados em `GET /compras`.
- Cupom de demonstração: **`NEXTECH10`** (10% de desconto).
- Frete grátis em compras acima de **R$ 299**.
- Todas as imagens de produto passam por `GET /produtos/:id/imagem`; o front-end usa
  `imagem_url` retornado pela API.
- Bootstrap 5.3 e Bootstrap Icons são servidos localmente (`site/vendor/`), então o site
  funciona mesmo sem internet. Apenas a fonte Manrope vem do Google Fonts e, sem conexão,
  o navegador usa a fonte padrão do sistema.

### Imagens no Google Drive

As imagens prontas para upload estão em `imagens-produtos/nextech-imagens-drive.zip`
(50 PNGs de 1600×1200). O Google Drive não gera miniatura de SVG, por isso o envio é
feito em PNG.

1. Abra a pasta no Drive e arraste o conteúdo do ZIP (ou descompacte antes).
   Mantenha os nomes dos arquivos (`01-ryzen-5-5600.png`, `02-athlon-3000g.png`, ...).
2. Compartilhe a pasta como **qualquer pessoa com o link** (leitor). O servidor baixa
   as miniaturas sem autenticação.
3. Crie uma **chave de API** no Google Cloud (APIs & Services → Credentials), ative a
   Google Drive API e defina `GOOGLE_DRIVE_API_KEY` no `.env`. Sem a chave, o script
   tenta o `embeddedfolderview`, que o Google pode devolver vazio.
4. Informe a pasta e sincronize os IDs:

```bash
npm run drive:sync -- https://drive.google.com/drive/folders/SEU_ID
# ou defina GOOGLE_DRIVE_FOLDER_ID no .env e rode apenas: npm run drive:sync
```

5. Rode `npm run migrate` para gravar os IDs na coluna `produto.imagem_drive_id`.

O `drive:sync` lê a listagem pública da pasta (via Drive API v3 quando há chave),
casa cada arquivo com o produto pelo nome e reescreve `data/imagens-drive.js`:

```js
module.exports = {
    "01-ryzen-5-5600": "ID_DO_ARQUIVO_NO_DRIVE"
}
```

A chave pode ser o nome com ou sem extensão. Se preferir, preencha o arquivo à mão
com o ID de cada arquivo (trecho entre `/d/` e `/view` na URL).

As imagens locais ficam em `imagens-produtos` (ou no caminho definido em
`IMAGENS_DIR`). Essa pasta é versionada no repositório.

---

## Testes

```bash
npm test        # validação, compras, API e front-end
npm run db:test # diagnóstico completo do banco
```

- `tests/validacao.test.js` — regras de filtro, paginação, ordenação e SQL parametrizado.
- `tests/compras.test.js` — validação dos itens, cupom, frete e cálculo dos totais.
- `tests/api.test.js` — sobe o Express em uma porta livre e testa catálogo, paginação,
  filtros, cadastro, login, JWT, perfil, imagens e compras com vários produtos. Os clientes
  e o estoque usados nos testes são restaurados ao final.
- `tests/site.test.js` — garante que as páginas, scripts, estilos e elementos essenciais
  do front-end existem e que o checkout usa a API.

O `npm run db:test` valida conexão, contagens, categorias, faixa de preço, paginação
(1–10, 11–20, ...), filtros, ordenações e o hash bcrypt do cliente demo.

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm start` | Sobe a API + site em `http://localhost:3000` |
| `npm run dev` | Igual ao start, com recarga automática |
| `npm run migrate` | Cria tabelas e carrega os dados (idempotente) |
| `npm run migrate:reset` | Apaga as tabelas e recarrega tudo |
| `npm run db:create` | Cria o banco, se necessário |
| `npm run db:test` | Diagnóstico do banco |
| `npm test` | Executa a suíte de testes |
| `npm run imagens` | Regenera as imagens SVG na pasta externa `imagens-produtos` |
| `npm run drive:sync` | Lê a pasta pública do Drive e gera `data/imagens-drive.js` |
| `npm run sql` | Regenera o `produto.sql` |

---

## Segurança aplicada

- Senhas com hash bcrypt (custo 10).
- JWT assinado com segredo do `.env`, expiração de 7 dias.
- Todas as consultas SQL usam placeholders (`?`) — sem concatenação de valores.
- Ordenação validada por lista branca (nunca interpolada da query).
- Validação e limitação de tamanho de todos os campos de entrada.
- Escapamento de HTML em nomes de cliente/produtos exibidos dinamicamente.
- `.env` fora do controle de versão.

---

Projeto acadêmico de Desenvolvimento de Sistemas — API Node.js + MySQL.
