const MAX_ITENS = 50
const QUANTIDADE_MAXIMA = 999
const CUPOM_VALIDO = "NEXTECH10"
const DESCONTO_CUPOM = 0.10
const FRETE_GRATIS_A_PARTIR = 299
const VALOR_FRETE = 29.90
const VIACEP_URL = "https://viacep.com.br/ws/"
const TIMEOUT_CEP = 5000

const UFS_VALIDAS = Object.freeze(
    "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")
)

const LIMITES_ENTREGA = Object.freeze({
    endereco: 120,
    numero: 20,
    complemento: 80,
    bairro: 80,
    cidade: 80
})

function centavos(valor) {
    return Math.round(Number(valor) * 100)
}

function reais(valorEmCentavos) {
    return Number((valorEmCentavos / 100).toFixed(2))
}

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

function textoEntrega(valor, limite) {
    return String(valor === undefined || valor === null ? "" : valor).trim().slice(0, limite)
}

function validarEntrega(entrada) {
    if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
        return { erro: "Informe os dados de entrega" }
    }

    const entrega = {
        cep: String(entrada.cep === undefined || entrada.cep === null ? "" : entrada.cep).replace(/\D/g, ""),
        endereco: textoEntrega(entrada.endereco, LIMITES_ENTREGA.endereco),
        numero: textoEntrega(entrada.numero, LIMITES_ENTREGA.numero),
        complemento: textoEntrega(entrada.complemento, LIMITES_ENTREGA.complemento),
        bairro: textoEntrega(entrada.bairro, LIMITES_ENTREGA.bairro),
        cidade: textoEntrega(entrada.cidade, LIMITES_ENTREGA.cidade),
        uf: textoEntrega(entrada.uf, 2).toUpperCase()
    }

    if (!/^\d{8}$/.test(entrega.cep)) {
        return { erro: "Informe um CEP válido com 8 dígitos" }
    }
    if (entrega.endereco.length < 3) {
        return { erro: "Informe o endereço de entrega" }
    }
    if (!entrega.numero) {
        return { erro: "Informe o número do endereço" }
    }
    if (entrega.bairro.length < 2) {
        return { erro: "Informe o bairro" }
    }
    if (entrega.cidade.length < 2) {
        return { erro: "Informe a cidade" }
    }
    if (!UFS_VALIDAS.includes(entrega.uf)) {
        return { erro: "Informe uma UF válida" }
    }

    return { entrega }
}

async function verificarCep(cep) {
    let controle = null
    let temporizador = null

    try {
        if (typeof AbortController === "function") {
            controle = new AbortController()
            temporizador = setTimeout(() => controle.abort(), TIMEOUT_CEP)
        }

        const opcoes = controle ? { signal: controle.signal } : undefined
        const resposta = await fetch(VIACEP_URL + cep + "/json/", opcoes)

        if (!resposta.ok) return { ok: true }

        const dados = await resposta.json()
        if (dados && dados.erro) {
            return { erro: "CEP não encontrado. Confira o CEP informado." }
        }

        return { ok: true }
    } catch {
        return { ok: true }
    } finally {
        if (temporizador) clearTimeout(temporizador)
    }
}

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
    UFS_VALIDAS,
    validarItens,
    validarCupom,
    validarEntrega,
    verificarCep,
    calcularTotais
}
