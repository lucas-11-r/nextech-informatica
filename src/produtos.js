const fs = require("fs/promises")
const path = require("path")
const express = require("express")
const db = require("../db")
const {
    PRODUTOS_POR_PAGINA,
    validarQueryProdutos,
    montarFiltrosSql,
    montarOrdenacao
} = require("./validacao")

const router = express.Router()

const CAMPOS = `id, nome, descricao, categoria, marca, preco, preco_antigo,
    estoque, destaque, caminho_img, quantidade_img, avaliacao, avaliacoes`

const DIR_IMAGENS = path.resolve(
    process.env.IMAGENS_DIR || path.join(__dirname, "..", "imagens-produtos")
)
const IMAGEM_PADRAO = path.join(__dirname, "..", "site", "assets", "img", "produto-placeholder.svg")
const TAMANHO_DRIVE = process.env.GOOGLE_DRIVE_IMAGE_SIZE || "w1200"
const TIMEOUT_DRIVE = Number(process.env.GOOGLE_DRIVE_TIMEOUT_MS || 8000)
const CACHE_DRIVE = new Map()

const TIPOS_IMAGEM = Object.freeze({
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif"
})

function adicionarUrlImagem(produto) {
    return {
        ...produto,
        imagem_url: "/produtos/" + produto.id + "/imagem"
    }
}

function adicionarUrlImagens(produtos) {
    return produtos.map(adicionarUrlImagem)
}

function idDriveValido(valor) {
    return /^[A-Za-z0-9_-]{10,}$/.test(String(valor || ""))
}

function tipoDaImagem(arquivo) {
    return TIPOS_IMAGEM[path.extname(String(arquivo || "")).toLowerCase()] || null
}

async function lerImagemLocal(produto) {
    const arquivo = path.basename(String(produto.caminho_img || ""))
    const base = arquivo.replace(/\.[^.]+$/, "")

    if (!base) return null

    // O catálogo guarda o nome .svg, mas a pasta pode ter o mesmo arquivo
    // em PNG/WebP (as imagens do Drive são rasterizadas).
    const candidatos = [
        arquivo,
        base + ".png",
        base + ".webp",
        base + ".jpg",
        base + ".jpeg"
    ]

    for (const nome of [...new Set(candidatos)]) {
        const tipo = tipoDaImagem(nome)
        if (!tipo) continue

        try {
            return {
                buffer: await fs.readFile(path.join(DIR_IMAGENS, nome)),
                tipo
            }
        } catch {
            // Tenta o próximo formato.
        }
    }

    return null
}

async function buscarImagemDrive(id) {
    const emCache = CACHE_DRIVE.get(id)
    if (emCache && emCache.expira > Date.now()) return emCache

    try {
        const url = "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(id) + "&sz=" + encodeURIComponent(TAMANHO_DRIVE)
        const resposta = await fetch(url, {
            redirect: "follow",
            signal: AbortSignal.timeout(TIMEOUT_DRIVE)
        })
        const tipo = String(resposta.headers.get("content-type") || "")
            .split(";")[0]
            .trim()
            .toLowerCase()

        if (!resposta.ok || !tipo.startsWith("image/")) return null

        const buffer = Buffer.from(await resposta.arrayBuffer())
        if (!buffer.length) return null

        const imagem = {
            buffer,
            tipo,
            expira: Date.now() + 24 * 60 * 60 * 1000
        }

        if (CACHE_DRIVE.size > 100) CACHE_DRIVE.clear()
        CACHE_DRIVE.set(id, imagem)
        return imagem
    } catch {
        return null
    }
}

async function lerImagemPadrao() {
    try {
        return {
            buffer: await fs.readFile(IMAGEM_PADRAO),
            tipo: "image/svg+xml"
        }
    } catch {
        return {
            buffer: Buffer.from(
                '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
                '<rect width="800" height="600" fill="#061a2e"/>' +
                '<text x="400" y="300" fill="#22d3ee" font-family="Arial" font-size="34" ' +
                'font-weight="bold" text-anchor="middle" dominant-baseline="middle">NEXTECH</text>' +
                "</svg>"
            ),
            tipo: "image/svg+xml"
        }
    }
}

// GET /produtos (e /produto) -> lista paginada com filtros e ordenação
router.get("/", async (req, res, next) => {
    try {
        const { erro, filtros } = validarQueryProdutos(req.query)
        if (erro) return res.status(400).json({ erro })

        const { where, valores } = montarFiltrosSql(filtros)
        const ordenacao = montarOrdenacao(filtros.ordem)
        const offset = (filtros.pagina - 1) * PRODUTOS_POR_PAGINA

        const [produtos] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto ${where} ORDER BY ${ordenacao} LIMIT ? OFFSET ?`,
            [...valores, PRODUTOS_POR_PAGINA, offset]
        )

        const [contagem] = await db.pool.query(
            `SELECT COUNT(*) AS total FROM produto ${where}`,
            valores
        )

        const total = Number(contagem[0].total)
        const totalPaginas = Math.max(1, Math.ceil(total / PRODUTOS_POR_PAGINA))

        return res.status(200).json({
            pagina: filtros.pagina,
            por_pagina: PRODUTOS_POR_PAGINA,
            total,
            total_paginas: totalPaginas,
            tem_anterior: filtros.pagina > 1,
            tem_proxima: filtros.pagina < totalPaginas,
            produtos: adicionarUrlImagens(produtos)
        })
    } catch (error) {
        next(error)
    }
})

// GET /produtos/categorias -> categorias com contagem
router.get("/categorias", async (req, res, next) => {
    try {
        const [linhas] = await db.pool.query(
            `SELECT categoria, COUNT(*) AS total
             FROM produto
             GROUP BY categoria
             ORDER BY categoria`
        )

        return res.status(200).json(
            linhas.map(linha => ({
                nome: linha.categoria,
                categoria: linha.categoria,
                total: Number(linha.total)
            }))
        )
    } catch (error) {
        next(error)
    }
})

// GET /produtos/filtros -> faixa de preço + categorias
router.get("/filtros", async (req, res, next) => {
    try {
        const [resumo] = await db.pool.query(
            "SELECT MIN(preco) AS preco_min, MAX(preco) AS preco_max, COUNT(*) AS total FROM produto"
        )
        const [categorias] = await db.pool.query(
            `SELECT categoria, COUNT(*) AS total
             FROM produto
             GROUP BY categoria
             ORDER BY categoria`
        )

        const dados = resumo[0] || {}
        return res.status(200).json({
            preco_min: dados.preco_min === null ? 0 : Number(dados.preco_min),
            preco_max: dados.preco_max === null ? 0 : Number(dados.preco_max),
            total: Number(dados.total || 0),
            categorias: categorias.map(linha => ({
                nome: linha.categoria,
                categoria: linha.categoria,
                total: Number(linha.total)
            }))
        })
    } catch (error) {
        next(error)
    }
})

// GET /produtos/destaques -> produtos em destaque
router.get("/destaques", async (req, res, next) => {
    try {
        const [produtos] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto
             WHERE destaque = 1
             ORDER BY avaliacao DESC, id ASC
             LIMIT 8`
        )
        return res.status(200).json(adicionarUrlImagens(produtos))
    } catch (error) {
        next(error)
    }
})

// GET /produtos/todos -> lista completa em array (compatibilidade)
router.get("/todos", async (req, res, next) => {
    try {
        const { erro, filtros } = validarQueryProdutos(req.query)
        if (erro) return res.status(400).json({ erro })

        const { where, valores } = montarFiltrosSql(filtros)
        const [produtos] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto ${where} ORDER BY id ASC`,
            valores
        )
        return res.status(200).json(adicionarUrlImagens(produtos))
    } catch (error) {
        next(error)
    }
})

// GET /produtos/:id/imagem -> imagem servida pelo próprio servidor.
// A origem pode ser o Google Drive (imagem_drive_id), uma pasta externa
// configurada em IMAGENS_DIR ou o SVG genérico de fallback.
router.get("/:id/imagem", async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido" })
        }

        const [linhas] = await db.pool.query(
            `SELECT id, nome, caminho_img, imagem_drive_id
             FROM produto WHERE id = ? LIMIT 1`,
            [id]
        )

        if (linhas.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado" })
        }

        const produto = linhas[0]
        let imagem = null

        if (idDriveValido(produto.imagem_drive_id)) {
            imagem = await buscarImagemDrive(produto.imagem_drive_id)
        }

        if (!imagem) imagem = await lerImagemLocal(produto)
        if (!imagem) imagem = await lerImagemPadrao()

        res.set("Cache-Control", "public, max-age=86400")
        res.set("Content-Type", imagem.tipo)
        return res.send(imagem.buffer)
    } catch (error) {
        next(error)
    }
})

// GET /produtos/:id -> produto específico
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID inválido" })
        }

        const [linhas] = await db.pool.query(
            `SELECT ${CAMPOS} FROM produto WHERE id = ? LIMIT 1`,
            [id]
        )

        if (linhas.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado" })
        }

        return res.status(200).json(adicionarUrlImagem(linhas[0]))
    } catch (error) {
        next(error)
    }
})

module.exports = router
