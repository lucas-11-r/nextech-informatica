// Testes estáticos do front-end: arquivos, referências e elementos essenciais.

const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const raiz = path.join(__dirname, "..")
const site = path.join(raiz, "site")

const paginas = [
    "index.html",
    "produtos.html",
    "produto.html",
    "carrinho.html",
    "monte-seu-pc.html",
    "login.html",
    "cadastro.html",
    "perfil.html"
]

function ler(relativo) {
    return fs.readFileSync(path.join(site, relativo), "utf8")
}

test("todas as páginas existem e usam o layout novo", () => {
    paginas.forEach(pagina => {
        const caminho = path.join(site, pagina)
        assert.ok(fs.existsSync(caminho), "faltando: " + pagina)

        const html = ler(pagina)
        assert.match(html, /<html lang="pt-BR">/, pagina)
        assert.match(html, /<meta name="viewport"/, pagina)
        assert.match(html, /css\/style\.css/, pagina)
        assert.match(html, /js\/layout\.js/, pagina)
        assert.match(html, /id="site-header"/, pagina)
        assert.match(html, /id="site-footer"/, pagina)
        assert.match(html, /NexTech/, pagina)
    })
})

test("arquivos antigos foram removidos", () => {
    ;["pages.js", "produtos.js", "style.css", "logo.png"].forEach(antigo => {
        assert.equal(fs.existsSync(path.join(site, antigo)), false, "ainda existe: " + antigo)
    })
})

test("scripts e folhas de estilo referenciados existem", () => {
    paginas.forEach(pagina => {
        const html = ler(pagina)
        const referencias = [...html.matchAll(/(?:src|href)="((?:js|css|assets|vendor)\/[^"]+)"/g)].map(m => m[1])

        referencias.forEach(referencia => {
            const alvo = path.join(site, referencia)
            assert.ok(fs.existsSync(alvo), pagina + " -> " + referencia)
        })
    })
})

test("o catálogo tem 50 produtos e usa imagens servidas pela API", () => {
    const produtos = require("../data/produtos")
    const api = fs.readFileSync(path.join(site, "js", "api.js"), "utf8")
    const ui = fs.readFileSync(path.join(site, "js", "ui.js"), "utf8")

    assert.equal(produtos.length, 50)
    assert.ok(produtos.every(produto => produto.id && produto.slug))
    assert.ok(fs.existsSync(path.join(site, "assets", "img", "produto-placeholder.svg")))
    assert.match(ui, /function urlImagem\(/)
    assert.match(ui, /produto\.imagem_url/)
    assert.match(api, /function apiPostAuth\(/)
})

test("fallback da home reflete o menor preço e a quantidade do catálogo", () => {
    const produtos = require("../data/produtos")
    const html = ler("index.html")

    const menor = Math.min(...produtos.map(produto => produto.preco))
    const esperado = "R$ " + menor.toFixed(2).replace(".", ",")

    assert.ok(html.includes('id="stat-menor">' + esperado), "fallback de preço desatualizado: " + esperado)
    assert.ok(html.includes('id="stat-produtos">' + produtos.length + "<"), "fallback de quantidade desatualizado")
})

test("catálogo tem busca, categoria, preço, ordenação e paginação", () => {
    const html = ler("produtos.html")

    ;["busca-catalogo", "lista-categorias", "range-min", "range-max", "ordenar", "grid-catalogo", "paginacao", "chips-filtros"]
        .forEach(id => assert.match(html, new RegExp('id="' + id + '"'), "faltando #" + id))

    const js = ler("js/produtos.js")
    assert.match(js, /const POR_PAGINA = 10/)
    assert.match(js, /preco_min/)
    assert.match(js, /preco_max/)
    assert.match(js, /menor_preco/)
    assert.match(js, /maior_preco/)
})

test("carrinho exige login e registra a compra na API", () => {
    const html = ler("carrinho.html")
    const js = ler("js/carrinho.js")
    const perfil = ler("js/perfil.js")

    assert.match(html, /id="modal-login"/)
    assert.match(js, /estaLogado\(\)/)
    assert.match(js, /loginUrl\("carrinho\.html"\)/)
    assert.match(js, /nextech_carrinho|getCarrinho/)
    assert.match(js, /apiPostAuth\("\/compras"/)
    assert.match(js, /produto_id/)
    assert.match(perfil, /apiGetAuth\("\/compras"\)/)
})

test("login guarda nome_cliente e token no localStorage", () => {
    const api = ler("js/api.js")
    const login = ler("js/login.js")

    assert.match(api, /localStorage\.setItem\("nome_cliente"/)
    assert.match(api, /localStorage\.setItem\("token"/)
    assert.match(login, /apiPost\("\/login"/)
    assert.match(login, /salvarSessao/)
})

test("cadastro envia os campos esperados para POST /cliente", () => {
    const html = ler("cadastro.html")
    const js = ler("js/cadastro.js")

    ;["nome", "cpf", "celular", "email", "senha"].forEach(campo => {
        assert.match(html, new RegExp('id="' + campo + '"'), "campo ausente no HTML: " + campo)
        assert.match(js, new RegExp('getElementById\\("' + campo + '"\\)'), "campo ausente no JS: " + campo)
    })

    assert.match(js, /apiPost\("\/cliente"/)
})

test("perfil usa a rota protegida e o token", () => {
    const js = ler("js/perfil.js")

    assert.match(js, /apiGetAuth\("\/cliente\/perfil"\)/)
    assert.match(js, /estaLogado\(\)/)
})

test("layout escapa o nome do cliente antes de montar o HTML", () => {
    const js = ler("js/layout.js")
    const ui = ler("js/ui.js")

    assert.match(ui, /function escapeHtml/)
    assert.match(js, /escapeHtml\(primeiro\)/)
    assert.match(js, /escapeHtml\(inicial\)/)
})
