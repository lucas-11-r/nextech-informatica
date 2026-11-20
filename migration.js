const dotenv = require("dotenv")
dotenv.config({ quiet: true })

const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const db = require("./db")
const produtos = require("./data/produtos")
const { imprimirDicas } = require("./scripts/ajuda-banco")

const RESET = process.argv.includes("--reset")
const NOME_BANCO = process.env.DB_DATABASE || "nextech"

const ESTRUTURA_CLIENTE = `
    CREATE TABLE IF NOT EXISTS cliente (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(100) NOT NULL,
        cpf CHAR(14) NOT NULL,
        celular CHAR(14) NOT NULL,
        email VARCHAR(100) NOT NULL,
        senha VARCHAR(512) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_cliente_cpf (cpf),
        UNIQUE KEY uq_cliente_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const ESTRUTURA_PRODUTO = `
    CREATE TABLE IF NOT EXISTS produto (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(200) NOT NULL,
        descricao TEXT NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        marca VARCHAR(60) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        preco_antigo DECIMAL(10,2) NULL,
        estoque INT NOT NULL DEFAULT 0,
        destaque TINYINT(1) NOT NULL DEFAULT 0,
        caminho_img VARCHAR(255) NOT NULL,
        imagem_drive_id VARCHAR(100) NULL,
        quantidade_img INT NOT NULL DEFAULT 1,
        avaliacao DECIMAL(2,1) NOT NULL DEFAULT 0,
        avaliacoes INT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        KEY idx_produto_categoria (categoria),
        KEY idx_produto_preco (preco),
        KEY idx_produto_destaque (destaque)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const ESTRUTURA_COMPRA = `
    CREATE TABLE IF NOT EXISTS compra (
        id INT NOT NULL AUTO_INCREMENT,
        cliente_id INT NOT NULL,
        codigo VARCHAR(30) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
        frete DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        data_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_compra_codigo (codigo),
        KEY idx_compra_cliente (cliente_id),
        CONSTRAINT fk_compra_cliente FOREIGN KEY (cliente_id)
            REFERENCES cliente(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const ESTRUTURA_COMPRA_ITEM = `
    CREATE TABLE IF NOT EXISTS compra_item (
        id INT NOT NULL AUTO_INCREMENT,
        compra_id INT NOT NULL,
        produto_id INT NOT NULL,
        nome_produto VARCHAR(200) NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        PRIMARY KEY (id),
        KEY idx_item_compra (compra_id),
        KEY idx_item_produto (produto_id),
        CONSTRAINT fk_item_compra FOREIGN KEY (compra_id)
            REFERENCES compra(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_produto FOREIGN KEY (produto_id)
            REFERENCES produto(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

async function garantirBanco() {
    if (!/^[A-Za-z0-9_]+$/.test(NOME_BANCO)) {
        throw new Error("O nome do banco em DB_DATABASE deve conter apenas letras, números e _")
    }

    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || ""
    })

    try {
        await conexao.query(
            `CREATE DATABASE IF NOT EXISTS \`${NOME_BANCO}\`
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )
    } finally {
        await conexao.end()
    }
}

async function tabelaTemColuna(conexao, tabela, coluna) {
    const [linhas] = await conexao.query(
        `SHOW COLUMNS FROM \`${tabela}\` LIKE ?`,
        [coluna]
    )
    return linhas.length > 0
}

async function criarTabelas(conexao) {
    if (RESET) {
        console.log("Modo --reset: removendo tabelas existentes...")
        await conexao.query("SET FOREIGN_KEY_CHECKS = 0")
        await conexao.query("DROP TABLE IF EXISTS compra_item")
        await conexao.query("DROP TABLE IF EXISTS compra")
        await conexao.query("DROP TABLE IF EXISTS produto")
        await conexao.query("DROP TABLE IF EXISTS cliente")
        await conexao.query("SET FOREIGN_KEY_CHECKS = 1")
    }

    // Estrutura antiga (peças automotivas) não tem a coluna marca.
    // Nesse caso, recria apenas a tabela de produtos para aplicar o novo schema.
    const [existeProduto] = await conexao.query("SHOW TABLES LIKE 'produto'")
    if (existeProduto.length > 0 && !(await tabelaTemColuna(conexao, "produto", "marca"))) {
        console.log("Schema antigo de produto detectado: recriando a tabela de produtos...")
        await conexao.query("DROP TABLE produto")
    }

    await conexao.query(ESTRUTURA_CLIENTE)
    await conexao.query(ESTRUTURA_PRODUTO)

    if (!(await tabelaTemColuna(conexao, "produto", "imagem_drive_id"))) {
        console.log("Adicionando a coluna imagem_drive_id à tabela produto...")
        await conexao.query(
            "ALTER TABLE produto ADD COLUMN imagem_drive_id VARCHAR(100) NULL AFTER caminho_img"
        )
    }

    await conexao.query(ESTRUTURA_COMPRA)
    await conexao.query(ESTRUTURA_COMPRA_ITEM)
}

async function inserirProdutos(conexao) {
    const [linhas] = await conexao.query("SELECT COUNT(*) AS total FROM produto")
    if (Number(linhas[0].total) > 0) {
        console.log("Produtos já existentes: nenhuma carga duplicada.")
        return Number(linhas[0].total)
    }

    const valores = produtos.map(produto => [
        produto.nome,
        produto.descricao,
        produto.categoria,
        produto.marca,
        produto.preco,
        produto.preco_antigo,
        produto.estoque,
        produto.destaque,
        produto.caminho_img,
        produto.imagem_drive_id,
        produto.quantidade_img,
        produto.avaliacao,
        produto.avaliacoes
    ])

    await conexao.query(
        `INSERT INTO produto
         (nome, descricao, categoria, marca, preco, preco_antigo, estoque,
          destaque, caminho_img, imagem_drive_id, quantidade_img, avaliacao, avaliacoes)
         VALUES ?`,
        [valores]
    )

    console.log("Produtos inseridos: " + valores.length)
    return valores.length
}

async function atualizarImagensDrive(conexao) {
    const comImagem = produtos.filter(produto => produto.imagem_drive_id)

    if (comImagem.length === 0) {
        console.log("Nenhum ID de imagem do Google Drive configurado.")
        return
    }

    for (const produto of comImagem) {
        await conexao.query(
            "UPDATE produto SET imagem_drive_id = ? WHERE id = ?",
            [produto.imagem_drive_id, produto.id]
        )
    }

    console.log("IDs de imagens do Google Drive atualizados: " + comImagem.length)
}

async function inserirClienteDemo(conexao) {
    const [linhas] = await conexao.query("SELECT COUNT(*) AS total FROM cliente")
    if (Number(linhas[0].total) > 0) {
        console.log("Clientes já existentes: nenhum cliente demo duplicado.")
        return
    }

    const senha = await bcrypt.hash("demo1234", 10)
    await conexao.query(
        `INSERT INTO cliente (nome, cpf, celular, email, senha)
         VALUES (?, ?, ?, ?, ?)`,
        [
            "Cliente Demo",
            "123.456.789-09",
            "(42)99999-0000",
            "demo@nextech.com",
            senha
        ]
    )
    console.log("Cliente demo criado: demo@nextech.com / demo1234")
}

async function executar() {
    let conexao
    try {
        console.log("Garantindo que o banco '" + NOME_BANCO + "' exista...")
        await garantirBanco()

        conexao = await db.pool.getConnection()
        await conexao.beginTransaction()

        await criarTabelas(conexao)
        const totalProdutos = await inserirProdutos(conexao)
        await atualizarImagensDrive(conexao)
        await inserirClienteDemo(conexao)

        await conexao.commit()

        const [clientes] = await conexao.query("SELECT COUNT(*) AS total FROM cliente")
        console.log("---------------------------------------------")
        console.log("Migration concluída com sucesso!")
        console.log("Banco: " + NOME_BANCO)
        console.log("Produtos: " + totalProdutos)
        console.log("Clientes: " + clientes[0].total)
        console.log("---------------------------------------------")
    } catch (error) {
        if (conexao) await conexao.rollback()
        console.error("Falha na migration:", error.message)
        imprimirDicas(error)
        process.exitCode = 1
    } finally {
        if (conexao) conexao.release()
        await db.pool.end()
    }
}

executar()
