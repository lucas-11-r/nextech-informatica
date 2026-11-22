// Atualiza preços e estoques no banco a partir de data/produtos.js.
// Diferente de `migrate:reset`, preserva clientes, compras e histórico.
// Uso: npm run catalogo:atualizar
const db = require("../db")
const produtos = require("../data/produtos")

async function principal() {
    const conexao = await db.pool.getConnection()

    try {
        await conexao.beginTransaction()

        for (const produto of produtos) {
            await conexao.query(
                "UPDATE produto SET preco = ?, preco_antigo = ?, estoque = ? WHERE id = ?",
                [produto.preco, produto.preco_antigo, produto.estoque, produto.id]
            )
        }

        await conexao.commit()
        console.log("Catálogo atualizado: " + produtos.length + " produtos.")
    } catch (erro) {
        await conexao.rollback()
        throw erro
    } finally {
        conexao.release()
        await db.pool.end()
    }
}

principal().catch(erro => {
    console.error("Falha ao atualizar o catálogo: " + erro.message)
    process.exit(1)
})
