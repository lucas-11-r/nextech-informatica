// Validação da lista de produtos e cálculo dos valores de uma compra.
// Os valores finais são sempre calculados aqui, nunca aceitos do navegador.

const MAX_ITENS = 50
const QUANTIDADE_MAXIMA = 999
const CUPOM_VALIDO = "NEXTECH10"
const DESCONTO_CUPOM = 0.10
const FRETE_GRATIS_A_PARTIR = 299
const VALOR_FRETE = 29.90

function centavos(valor) {
    return Math.round(Number(valor) * 100)
}

function reais(valorEmCentavos) {
    return Number((valorEmCentavos / 100).toFixed(2))
}

/**
 * Normaliza e agrupa os itens enviados pelo cliente.
 * Aceita produto_id/produtoId/id e quantidade/qtd no corpo.
 */
function validarItens(entrada) {
    if (!Array.isArray(entrada) || entrada.length === 0) {
        return { erro: "Informe ao menos um produto na compra" }
    }

    if (entrada.length > MAX_ITENS) {
        return { erro: "A compra pode ter no máximo " + MAX_ITENS + " produtos diferentes" }
    }

    const agrupados = new Map()

    for (const item of entrada) {
        if (!item || typeof item !== "object") {
            return { erro: "Item de compra inválido" }
        }

        const produtoId = Number(item.produto_id ?? item.produtoId ?? item.id)
        const quantidade = Number(item.quantidade ?? item.qtd ?? 1)

        if (!Number.isInteger(produtoId) || produtoId <= 0) {
            return { erro: "ID de produto inválido" }
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            return { erro: "Quantidade inválida para o produto " + produtoId }
        }

        if (quantidade > QUANTIDADE_MAXIMA) {
            return { erro: "A quantidade máxima por produto é " + QUANTIDADE_MAXIMA }
        }

        agrupados.set(produtoId, (agrupados.get(produtoId) || 0) + quantidade)
    }

    const itens = [...agrupados.entries()].map(([produto_id, quantidade]) => ({
        produto_id,
        quantidade
    }))

    if (itens.some(item => item.quantidade > QUANTIDADE_MAXIMA)) {
        return { erro: "A quantidade máxima por produto é " + QUANTIDADE_MAXIMA }
    }

    return { itens }
}

function validarCupom(cupom) {
    const codigo = String(cupom === undefined || cupom === null ? "" : cupom).trim().toUpperCase()

    if (!codigo) return { cupom: null }
    if (codigo !== CUPOM_VALIDO) return { erro: "Cupom inválido" }

    return { cupom: codigo }
}

/**
 * Calcula subtotal, desconto, frete e total em reais.
 * `itens` deve conter preco_unitario e quantidade.
 */
function calcularTotais(itens, cupom) {
    const subtotalCentavos = itens.reduce((soma, item) => {
        return soma + centavos(item.preco_unitario) * Number(item.quantidade)
    }, 0)

    const descontoCentavos = cupom === CUPOM_VALIDO
        ? Math.round(subtotalCentavos * DESCONTO_CUPOM)
        : 0

    const freteCentavos = subtotalCentavos >= centavos(FRETE_GRATIS_A_PARTIR)
        ? 0
        : centavos(VALOR_FRETE)

    const totalCentavos = subtotalCentavos - descontoCentavos + freteCentavos

    return {
        subtotal: reais(subtotalCentavos),
        desconto: reais(descontoCentavos),
        frete: reais(freteCentavos),
        total: reais(totalCentavos)
    }
}

module.exports = {
    MAX_ITENS,
    QUANTIDADE_MAXIMA,
    CUPOM_VALIDO,
    DESCONTO_CUPOM,
    FRETE_GRATIS_A_PARTIR,
    VALOR_FRETE,
    validarItens,
    validarCupom,
    calcularTotais
}
