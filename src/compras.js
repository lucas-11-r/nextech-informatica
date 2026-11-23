const crypto = require("crypto")
const express = require("express")
const db = require("../db")
const { autenticar } = require("./auth")
const {
    validarItens,
    validarCupom,
    validarEntrega,
    verificarCep,
    calcularTotais
} = require("./validacao-compras")

const router = express.Router()

function falha(status, mensagem, detalhes) {
    const erro = new Error(mensagem)
    erro.status = status
    erro.detalhes = detalhes
    return erro
}

function criarCodigo() {
    const tempo = Date.now().toString(36).toUpperCase()
    const aleatorio = crypto.randomBytes(2).toString("hex").toUpperCase()
    return "NX" + tempo + aleatorio
}

function agruparCompras(linhas) {
    const mapa = new Map()

    for (const linha of linhas) {
        if (!mapa.has(linha.id)) {
            mapa.set(linha.id, {
                id: linha.id,
                codigo: linha.codigo,
                data_compra: linha.data_compra,
                subtotal: Number(linha.subtotal),
                desconto: Number(linha.desconto),
                frete: Number(linha.frete),
                total: Number(linha.total),
                itens: []
            })
        }

        if (linha.produto_id !== null && linha.produto_id !== undefined) {
            mapa.get(linha.id).itens.push({
                produto_id: linha.produto_id,
                nome: linha.nome_produto,
                quantidade: linha.quantidade,
                preco_unitario: Number(linha.preco_unitario),
                subtotal: Number(linha.item_subtotal)
            })
        }
    }

    return [...mapa.values()]
}

const SQL_HISTORICO = `
    SELECT c.id, c.codigo, c.data_compra, c.subtotal, c.desconto, c.frete, c.total,
           i.produto_id, i.nome_produto, i.quantidade, i.preco_unitario,
           i.subtotal AS item_subtotal
    FROM compra c
    LEFT JOIN compra_item i ON i.compra_id = c.id
`

router.post("/", autenticar, async (req, res, next) => {
    let conexao

    try {
        const body = req.body || {}
        const itensValidados = validarItens(body.itens || body.produtos)
        if (itensValidados.erro) {
            return res.status(400).json({ erro: itensValidados.erro })
        }

        const cupomValidado = validarCupom(body.cupom)
        if (cupomValidado.erro) {
            return res.status(400).json({ erro: cupomValidado.erro })
        }

        const entregaValidada = validarEntrega(body.entrega)
        if (entregaValidada.erro) {
            return res.status(400).json({ erro: entregaValidada.erro })
        }

        const cepVerificado = await verificarCep(entregaValidada.entrega.cep)
        if (cepVerificado.erro) {
            return res.status(400).json({ erro: cepVerificado.erro })
        }

        const solicitados = itensValidados.itens
        const ids = solicitados.map(item => item.produto_id)

        conexao = await db.pool.getConnection()
        await conexao.beginTransaction()

        const [produtos] = await conexao.query(
            `SELECT id, nome, preco, estoque
             FROM produto
             WHERE id IN (?)
             FOR UPDATE`,
            [ids]
        )

        const mapa = new Map(produtos.map(produto => [Number(produto.id), produto]))
        const faltando = ids.filter(id => !mapa.has(id))

        if (faltando.length > 0) {
            throw falha(404, "Produto não encontrado", { produtos: faltando })
        }

        const itens = solicitados.map(item => {
            const produto = mapa.get(item.produto_id)
            const precoUnitario = Number(produto.preco)
            const quantidade = item.quantidade

            return {
                produto_id: item.produto_id,
                nome: produto.nome,
                quantidade,
                preco_unitario: precoUnitario,
                subtotal: Number((precoUnitario * quantidade).toFixed(2)),
                estoque: Number(produto.estoque)
            }
        })

        for (const item of itens) {
            if (item.estoque < item.quantidade) {
                throw falha(409, "Estoque insuficiente para " + item.nome, {
                    produto_id: item.produto_id,
                    estoque: item.estoque
                })
            }
        }

        const totais = calcularTotais(itens, cupomValidado.cupom)
        const codigo = criarCodigo()

        const [resultado] = await conexao.query(
            `INSERT INTO compra (cliente_id, codigo, subtotal, desconto, frete, total)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.usuario.id,
                codigo,
                totais.subtotal.toFixed(2),
                totais.desconto.toFixed(2),
                totais.frete.toFixed(2),
                totais.total.toFixed(2)
            ]
        )

        const compraId = resultado.insertId
        const valoresItens = itens.map(item => [
            compraId,
            item.produto_id,
            item.nome,
            item.quantidade,
            item.preco_unitario.toFixed(2),
            item.subtotal.toFixed(2)
        ])

        await conexao.query(
            `INSERT INTO compra_item
             (compra_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal)
             VALUES ?`,
            [valoresItens]
        )

        for (const item of itens) {
            const [atualizacao] = await conexao.query(
                `UPDATE produto
                 SET estoque = estoque - ?
                 WHERE id = ? AND estoque >= ?`,
                [item.quantidade, item.produto_id, item.quantidade]
            )

            if (atualizacao.affectedRows !== 1) {
                throw falha(409, "Estoque insuficiente para " + item.nome, {
                    produto_id: item.produto_id
                })
            }
        }

        const [datas] = await conexao.query(
            "SELECT data_compra FROM compra WHERE id = ? LIMIT 1",
            [compraId]
        )

        await conexao.commit()

        return res.status(201).json({
            msg: "Compra registrada com sucesso",
            compra: {
                id: compraId,
                codigo,
                data_compra: datas[0] ? datas[0].data_compra : new Date(),
                ...totais,
                itens: itens.map(item => ({
                    produto_id: item.produto_id,
                    nome: item.nome,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                    subtotal: item.subtotal
                }))
            }
        })
    } catch (error) {
        if (conexao) {
            try {
                await conexao.rollback()
            } catch {

            }
        }

        if (error && error.status) {
            return res.status(error.status).json({
                erro: error.message,
                ...(error.detalhes || {})
            })
        }

        next(error)
    } finally {
        if (conexao) conexao.release()
    }
})

router.get("/", autenticar, async (req, res, next) => {
    try {
        const [linhas] = await db.pool.query(
            SQL_HISTORICO + ` WHERE c.cliente_id = ?
                              ORDER BY c.data_compra DESC, c.id DESC, i.id ASC`,
            [req.usuario.id]
        )

        const compras = agruparCompras(linhas)
        return res.status(200).json({ total: compras.length, compras })
    } catch (error) {
        next(error)
    }
})

router.get("/:id", autenticar, async (req, res, next) => {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: "ID de compra inválido" })
        }

        const [linhas] = await db.pool.query(
            SQL_HISTORICO + ` WHERE c.id = ? AND c.cliente_id = ?
                              ORDER BY i.id ASC`,
            [id, req.usuario.id]
        )

        if (linhas.length === 0) {
            return res.status(404).json({ erro: "Compra não encontrada" })
        }

        return res.status(200).json({ compra: agruparCompras(linhas)[0] })
    } catch (error) {
        next(error)
    }
})

module.exports = router
