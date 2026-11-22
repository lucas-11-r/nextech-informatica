const test = require("node:test")
const assert = require("node:assert/strict")

const {
    CUPOM_VALIDO,
    FRETE_GRATIS_A_PARTIR,
    VALOR_FRETE,
    UFS_VALIDAS,
    validarItens,
    validarCupom,
    validarEntrega,
    verificarCep,
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

const entregaValida = {
    cep: "84010-010",
    endereco: "Rua Dr. Augusto Viana da Silveira",
    numero: "1200",
    complemento: "Apto 1",
    bairro: "Centro",
    cidade: "Ponta Grossa",
    uf: "pr"
}

test("valida e normaliza o endereço de entrega", () => {
    const resultado = validarEntrega(entregaValida)

    assert.equal(resultado.erro, undefined)
    assert.deepEqual(resultado.entrega, {
        cep: "84010010",
        endereco: "Rua Dr. Augusto Viana da Silveira",
        numero: "1200",
        complemento: "Apto 1",
        bairro: "Centro",
        cidade: "Ponta Grossa",
        uf: "PR"
    })
})

test("rejeita entrega ausente ou campos obrigatórios inválidos", () => {
    const casos = [
        [undefined, /dados de entrega/],
        [null, /dados de entrega/],
        [{}, /CEP válido/],
        [{ ...entregaValida, cep: "84010" }, /CEP válido/],
        [{ ...entregaValida, endereco: "R" }, /endereço de entrega/],
        [{ ...entregaValida, numero: "" }, /número do endereço/],
        [{ ...entregaValida, bairro: "A" }, /bairro/],
        [{ ...entregaValida, cidade: "P" }, /cidade/]
    ]

    for (const [entrega, esperado] of casos) {
        assert.match(validarEntrega(entrega).erro, esperado)
    }
})

test("aceita apenas UFs válidas e limita o tamanho dos campos", () => {
    assert.match(validarEntrega({ ...entregaValida, uf: "ZZ" }).erro, /UF válida/)
    assert.equal(UFS_VALIDAS.length, 27)

    const resultado = validarEntrega({
        ...entregaValida,
        endereco: "A".repeat(200),
        complemento: "B".repeat(200)
    })

    assert.equal(resultado.erro, undefined)
    assert.equal(resultado.entrega.endereco.length, 120)
    assert.equal(resultado.entrega.complemento.length, 80)
})

test("verificarCep confirma a existência do CEP no ViaCEP", async () => {
    const fetchOriginal = globalThis.fetch
    let urlConsultada = ""

    globalThis.fetch = async url => {
        urlConsultada = url
        return { ok: true, json: async () => ({ cep: "84010010", uf: "PR" }) }
    }

    try {
        assert.deepEqual(await verificarCep("84010010"), { ok: true })
        assert.match(urlConsultada, /viacep\.com\.br\/ws\/84010010\/json\//)
    } finally {
        globalThis.fetch = fetchOriginal
    }
})

test("verificarCep recusa CEP inexistente", async () => {
    const fetchOriginal = globalThis.fetch
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ erro: true }) })

    try {
        assert.match((await verificarCep("00000000")).erro, /CEP não encontrado/)
    } finally {
        globalThis.fetch = fetchOriginal
    }
})

test("falha do ViaCEP não bloqueia a compra", async () => {
    const fetchOriginal = globalThis.fetch

    try {
        globalThis.fetch = async () => { throw new Error("sem rede") }
        assert.deepEqual(await verificarCep("84010010"), { ok: true })

        globalThis.fetch = async () => ({ ok: false })
        assert.deepEqual(await verificarCep("84010010"), { ok: true })
    } finally {
        globalThis.fetch = fetchOriginal
    }
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
