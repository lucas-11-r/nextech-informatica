const test = require("node:test")
const assert = require("node:assert/strict")

const {
    CUPOM_VALIDO,
    FRETE_GRATIS_A_PARTIR,
    VALOR_FRETE,
    validarItens,
    validarCupom,
    calcularTotais
} = require("../src/validacao-compras")

test("valida e agrupa itens repetidos", () => {
    const resultado = validarItens([
        { produto_id: 1, quantidade: 2 },
        { produto_id: "1", quantidade: 3 },
        { id: 2, qtd: 1 }
    ])

    assert.equal(resultado.erro, undefined)
    assert.deepEqual(resultado.itens, [
        { produto_id: 1, quantidade: 5 },
        { produto_id: 2, quantidade: 1 }
    ])
})

test("rejeita lista vazia, IDs e quantidades inválidas", () => {
    assert.match(validarItens([]).erro, /ao menos um produto/)
    assert.match(validarItens([{ produto_id: 0, quantidade: 1 }]).erro, /ID de produto/)
    assert.match(validarItens([{ produto_id: 1, quantidade: 0 }]).erro, /Quantidade inválida/)
    assert.match(validarItens([{ produto_id: 1, quantidade: 1.5 }]).erro, /Quantidade inválida/)
    assert.match(validarItens([null]).erro, /Item de compra inválido/)
})

test("aceita somente o cupom configurado", () => {
    assert.deepEqual(validarCupom(""), { cupom: null })
    assert.deepEqual(validarCupom("nextech10"), { cupom: CUPOM_VALIDO })
    assert.match(validarCupom("OUTRO").erro, /Cupom inválido/)
})

test("calcula subtotal, desconto, frete e total", () => {
    const itens = [
        { preco_unitario: 100, quantidade: 2 },
        { preco_unitario: 50, quantidade: 1 }
    ]

    const comCupom = calcularTotais(itens, CUPOM_VALIDO)
    assert.equal(comCupom.subtotal, 250)
    assert.equal(comCupom.desconto, 25)
    assert.equal(comCupom.frete, VALOR_FRETE)
    assert.equal(comCupom.total, 254.90)

    const semCupom = calcularTotais([
        { preco_unitario: FRETE_GRATIS_A_PARTIR, quantidade: 1 }
    ], null)
    assert.equal(semCupom.subtotal, FRETE_GRATIS_A_PARTIR)
    assert.equal(semCupom.desconto, 0)
    assert.equal(semCupom.frete, 0)
    assert.equal(semCupom.total, FRETE_GRATIS_A_PARTIR)
})
