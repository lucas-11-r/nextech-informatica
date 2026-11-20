// Componentes reutilizáveis: cards, preços, estrelas, toast e carrinho local.

const IMG_PADRAO = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#061a2e"/><stop offset="1" stop-color="#0b3b6f"/></linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#g)"/>' +
    '<text x="400" y="300" fill="#22d3ee" font-family="Arial" font-size="34" font-weight="bold" text-anchor="middle" dominant-baseline="middle">NEXTECH</text>' +
    '<text x="400" y="342" fill="#94a3b8" font-family="Arial" font-size="18" text-anchor="middle">Imagem indisponível</text></svg>'
)

const CHAVE_CARRINHO = "nextech_carrinho"
const CHAVE_FAVORITOS = "nextech_favoritos"

function escapeHtml(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR")
}

function opcoesParcelamento(preco) {
    const valor = Number(preco || 0)
    const vezes = valor >= 300 ? 12 : valor >= 120 ? 6 : valor >= 60 ? 3 : 1
    return { vezes, valor: valor / vezes }
}

function calcularDesconto(preco, precoAntigo) {
    if (!precoAntigo || Number(precoAntigo) <= Number(preco)) return 0
    return Math.round((1 - Number(preco) / Number(precoAntigo)) * 100)
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag)
    if (classe) elemento.className = classe
    if (texto !== undefined && texto !== null) elemento.textContent = texto
    return elemento
}

function urlImagem(produto) {
    let caminho = IMG_PADRAO

    if (produto && produto.imagem_url) caminho = produto.imagem_url
    else if (produto && produto.id) caminho = "/produtos/" + produto.id + "/imagem"

    if (caminho === IMG_PADRAO || /^(https?:|data:)/i.test(caminho)) return caminho
    return API_URL + caminho
}

function configurarImagem(img, produto) {
    img.loading = "lazy"
    img.alt = produto ? produto.nome : "Produto NexTech"
    img.addEventListener("error", () => {
        img.onerror = null
        img.src = IMG_PADRAO
    }, { once: true })
    img.src = urlImagem(produto)
}

function criarEstrelas(nota, avaliacoes) {
    const container = criarElemento("div", "rating")
    const valor = Number(nota || 0)

    for (let i = 1; i <= 5; i++) {
        const icone = document.createElement("i")
        if (valor >= i) icone.className = "bi bi-star-fill"
        else if (valor >= i - 0.5) icone.className = "bi bi-star-half"
        else icone.className = "bi bi-star"
        container.append(icone)
    }

    const texto = document.createElement("span")
    texto.textContent = valor.toFixed(1) + (avaliacoes ? " (" + formatarNumero(avaliacoes) + ")" : "")
    container.append(texto)
    return container
}

function mostrarToast(mensagem, tipo = "success") {
    let container = document.getElementById("toast-container")
    if (!container) {
        container = criarElemento("div", "toast-container position-fixed top-0 end-0 p-3")
        container.id = "toast-container"
        container.style.zIndex = "1090"
        document.body.append(container)
    }

    const toast = criarElemento("div", "toast align-items-center text-bg-" + tipo + " border-0")
    toast.setAttribute("role", "alert")
    toast.setAttribute("aria-live", "assertive")
    toast.setAttribute("aria-atomic", "true")

    const flex = criarElemento("div", "d-flex")
    const corpo = criarElemento("div", "toast-body d-flex align-items-center gap-2")
    const icone = document.createElement("i")
    icone.className = tipo === "danger"
        ? "bi bi-exclamation-triangle-fill"
        : tipo === "warning"
            ? "bi bi-exclamation-circle-fill"
            : "bi bi-check-circle-fill"
    const texto = document.createElement("span")
    texto.textContent = mensagem
    corpo.append(icone, texto)

    const fechar = criarElemento("button", "btn-close btn-close-white me-2 m-auto")
    fechar.type = "button"
    fechar.setAttribute("data-bs-dismiss", "toast")
    fechar.setAttribute("aria-label", "Fechar")

    flex.append(corpo, fechar)
    toast.append(flex)
    container.append(toast)

    if (window.bootstrap && bootstrap.Toast) {
        const instancia = new bootstrap.Toast(toast, { delay: 3800 })
        toast.addEventListener("hidden.bs.toast", () => toast.remove())
        instancia.show()
    } else {
        setTimeout(() => toast.remove(), 3800)
    }
}

/* ----------------------------- Carrinho ----------------------------- */
// Cópia em memória: usada quando o navegador bloqueia o localStorage, para o
// carrinho continuar funcionando (mesmo que só nesta aba).
let carrinhoMemoria = []
let avisoSemArmazenamento = false
let armazenamentoDisponivel

function obterArmazenamento() {
    if (armazenamentoDisponivel !== undefined) return armazenamentoDisponivel

    const testar = obter => {
        try {
            const armazenamento = obter()
            armazenamento.setItem("__nextech_sonda__", "1")
            armazenamento.removeItem("__nextech_sonda__")
            return armazenamento
        } catch {
            return null
        }
    }

    armazenamentoDisponivel = testar(() => localStorage) || testar(() => sessionStorage)

    return armazenamentoDisponivel
}

function lerDoArmazenamento(chave) {
    const armazenamento = obterArmazenamento()
    if (!armazenamento) return null
    try {
        return armazenamento.getItem(chave)
    } catch {
        return null
    }
}

function gravarNoArmazenamento(chave, valor) {
    const armazenamento = obterArmazenamento()
    if (!armazenamento) return false
    try {
        armazenamento.setItem(chave, valor)
        return true
    } catch {
        return false
    }
}

function removerDoArmazenamento(chave) {
    const armazenamento = obterArmazenamento()
    if (!armazenamento) return false
    try {
        armazenamento.removeItem(chave)
        return true
    } catch {
        return false
    }
}

function avisarCarrinhoSemArmazenamento() {
    if (avisoSemArmazenamento) return
    avisoSemArmazenamento = true
    if (document.body) {
        mostrarToast(
            "Este navegador bloqueou o armazenamento. O carrinho fica salvo apenas nesta aba.",
            "warning"
        )
    }
}

// Aceita o formato atual e também carrinhos antigos (produto_id/quantidade).
function normalizarItemCarrinho(item) {
    if (!item || typeof item !== "object") return null

    const id = Number(item.id ?? item.produto_id ?? item.produtoId)
    if (!Number.isFinite(id) || id <= 0) return null

    const preco = Number(item.preco ?? item.preco_unitario ?? item.precoUnitario ?? 0)
    const quantidade = Number.parseInt(item.qtd ?? item.quantidade ?? item.qty ?? 1, 10)
    const estoque = Number(item.estoque)

    return {
        ...item,
        id,
        nome: String(item.nome ?? item.nome_produto ?? "Produto #" + id),
        preco: Number.isFinite(preco) ? preco : 0,
        qtd: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
        estoque: estoque > 0 ? estoque : 999,
        imagem_url: item.imagem_url || item.imagem || "/produtos/" + id + "/imagem"
    }
}

function getCarrinho() {
    const bruto = lerDoArmazenamento(CHAVE_CARRINHO)
    let lista = []

    if (bruto) {
        try {
            const dados = JSON.parse(bruto)
            if (Array.isArray(dados)) lista = dados
        } catch {
            lista = []
        }
    }

    // Sem nada no armazenamento, cai para a cópia em memória (bloqueio/quota).
    if (!lista.length && carrinhoMemoria.length) lista = carrinhoMemoria

    const porId = new Map()
    lista.forEach(item => {
        const normalizado = normalizarItemCarrinho(item)
        if (!normalizado) return

        const existente = porId.get(normalizado.id)
        if (existente) {
            existente.qtd = Math.min(existente.qtd + normalizado.qtd, normalizado.estoque)
            return
        }
        porId.set(normalizado.id, normalizado)
    })

    return [...porId.values()]
}

function salvarCarrinho(carrinho) {
    carrinhoMemoria = carrinho.map(item => ({ ...item }))
    const salvo = gravarNoArmazenamento(CHAVE_CARRINHO, JSON.stringify(carrinho))
    if (!salvo) avisarCarrinhoSemArmazenamento()

    atualizarBadgeCarrinho(true)
    try {
        window.dispatchEvent(new CustomEvent("carrinho:alterado", { detail: { carrinho } }))
    } catch {
        // Navegadores muito antigos não têm CustomEvent: segue sem notificar.
    }
    return salvo
}

function adicionarAoCarrinho(produto, quantidade = 1) {
    const id = Number(produto && produto.id)
    if (!Number.isFinite(id) || id <= 0) return getCarrinho()

    const carrinho = getCarrinho()
    const estoque = Number(produto.estoque) > 0 ? Number(produto.estoque) : 999
    const adicionar = Math.max(1, Math.min(Number.parseInt(quantidade, 10) || 1, estoque))
    const existente = carrinho.find(item => Number(item.id) === id)

    if (existente) {
        const limite = Math.min(estoque, Number(existente.estoque) || estoque)
        existente.qtd = Math.min(Number(existente.qtd || 0) + adicionar, limite)
        existente.estoque = limite
    } else {
        carrinho.push({
            id,
            nome: String(produto.nome || "Produto #" + id),
            preco: Number(produto.preco) || 0,
            preco_antigo: produto.preco_antigo ? Number(produto.preco_antigo) : null,
            caminho_img: produto.caminho_img,
            imagem_url: urlImagem(produto),
            categoria: produto.categoria,
            marca: produto.marca,
            estoque,
            qtd: adicionar
        })
    }

    salvarCarrinho(carrinho)
    return carrinho
}

function removerDoCarrinho(id) {
    salvarCarrinho(getCarrinho().filter(item => Number(item.id) !== Number(id)))
}

function alterarQuantidadeCarrinho(id, delta) {
    const carrinho = getCarrinho()
    const item = carrinho.find(produto => Number(produto.id) === Number(id))
    if (!item) return

    const limite = Number(item.estoque || 999)
    item.qtd = Math.max(1, Math.min(Number(item.qtd || 1) + Number(delta), limite))
    salvarCarrinho(carrinho)
}

function limparCarrinho() {
    carrinhoMemoria = []
    removerDoArmazenamento(CHAVE_CARRINHO)
    atualizarBadgeCarrinho()
    try {
        window.dispatchEvent(new CustomEvent("carrinho:alterado", { detail: { carrinho: [] } }))
    } catch {
        // Sem CustomEvent: nada a notificar.
    }
}

function totalCarrinho(carrinho = getCarrinho()) {
    return carrinho.reduce((total, item) => total + Number(item.preco) * Number(item.qtd || 1), 0)
}

function quantidadeCarrinho() {
    return getCarrinho().reduce((total, item) => total + Number(item.qtd || 1), 0)
}

function atualizarBadgeCarrinho(animar = false) {
    const quantidade = quantidadeCarrinho()
    document.querySelectorAll("[data-cart-count]").forEach(elemento => {
        elemento.textContent = quantidade > 99 ? "99+" : String(quantidade)
        elemento.style.display = quantidade > 0 ? "grid" : "none"
        elemento.setAttribute(
            "aria-label",
            quantidade + (quantidade === 1 ? " item no carrinho" : " itens no carrinho")
        )

        if (!animar) return
        elemento.classList.remove("cart-count-pulso")
        void elemento.offsetWidth
        elemento.classList.add("cart-count-pulso")
        clearTimeout(elemento._pulsoTimer)
        elemento._pulsoTimer = setTimeout(() => elemento.classList.remove("cart-count-pulso"), 700)
    })
}

// Dá um retorno visual no botão do card depois de adicionar.
function marcarProdutoAdicionado(botao) {
    if (!botao) return
    if (!botao.dataset.rotuloOriginal) botao.dataset.rotuloOriginal = botao.innerHTML

    botao.classList.add("adicionado")
    botao.innerHTML = '<i class="bi bi-check2"></i> Adicionado'
    clearTimeout(botao._timerAdicionado)
    botao._timerAdicionado = setTimeout(() => {
        botao.classList.remove("adicionado")
        botao.innerHTML = botao.dataset.rotuloOriginal
    }, 1800)
}

/* ----------------------------- Favoritos ----------------------------- */
function getFavoritos() {
    try {
        const dados = JSON.parse(lerDoArmazenamento(CHAVE_FAVORITOS) || "[]")
        return Array.isArray(dados) ? dados.map(Number) : []
    } catch {
        return []
    }
}

function toggleFavorito(id) {
    const favoritos = getFavoritos()
    const numero = Number(id)
    const indice = favoritos.indexOf(numero)
    if (indice >= 0) favoritos.splice(indice, 1)
    else favoritos.push(numero)
    if (!gravarNoArmazenamento(CHAVE_FAVORITOS, JSON.stringify(favoritos))) {
        avisarCarrinhoSemArmazenamento()
    }
    return favoritos.includes(numero)
}

/* ----------------------------- Cards ----------------------------- */
function criarCardProduto(produto) {
    const card = criarElemento("article", "product-card")
    const desconto = calcularDesconto(produto.preco, produto.preco_antigo)
    const parcelas = opcoesParcelamento(produto.preco)
    const link = "produto.html?id=" + produto.id

    const media = criarElemento("div", "product-media")
    const linkImagem = document.createElement("a")
    linkImagem.href = link
    linkImagem.setAttribute("aria-label", "Ver " + produto.nome)
    const imagem = document.createElement("img")
    configurarImagem(imagem, produto)
    linkImagem.append(imagem)
    media.append(linkImagem)

    const badges = criarElemento("div", "product-badges")
    if (desconto > 0) badges.append(criarElemento("span", "badge-oferta", "-" + desconto + "%"))
    if (Number(produto.preco) >= 299) badges.append(criarElemento("span", "badge-frete", "Frete grátis"))
    if (badges.children.length) media.append(badges)

    const favorito = criarElemento("button", "product-fav")
    favorito.type = "button"
    favorito.setAttribute("aria-label", "Favoritar produto")
    const favoritos = getFavoritos()
    const ativo = favoritos.includes(Number(produto.id))
    favorito.classList.toggle("ativo", ativo)
    favorito.innerHTML = ativo ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>'
    favorito.addEventListener("click", event => {
        event.preventDefault()
        const marcado = toggleFavorito(produto.id)
        favorito.classList.toggle("ativo", marcado)
        favorito.innerHTML = marcado ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>'
        mostrarToast(marcado ? "Produto adicionado aos favoritos." : "Produto removido dos favoritos.", "success")
    })
    media.append(favorito)

    const corpo = criarElemento("div", "product-body")
    const marca = criarElemento("div", "product-brand")
    marca.append(criarElemento("span", "", produto.marca || "NexTech"))
    marca.append(criarElemento("span", "", produto.categoria || ""))
    corpo.append(marca)

    const nome = document.createElement("a")
    nome.className = "product-name"
    nome.href = link
    nome.textContent = produto.nome
    corpo.append(nome)

    corpo.append(criarEstrelas(produto.avaliacao, produto.avaliacoes))

    const preco = criarElemento("div", "product-price")
    if (produto.preco_antigo && Number(produto.preco_antigo) > Number(produto.preco)) {
        preco.append(criarElemento("div", "price-old", "De " + formatarPreco(produto.preco_antigo)))
    }
    preco.append(criarElemento("div", "price-current", formatarPreco(produto.preco)))
    const parcelamento = criarElemento("div", "price-installments")
    parcelamento.innerHTML = "ou <strong>" + parcelas.vezes + "x de " + formatarPreco(parcelas.valor) + "</strong> sem juros"
    preco.append(parcelamento)
    corpo.append(preco)

    const estoque = Number(produto.estoque || 0)
    const status = criarElemento("div", "product-stock" + (estoque <= 5 ? " baixo" : ""))
    status.innerHTML = estoque > 0
        ? '<i class="bi bi-check-circle-fill"></i> ' + (estoque > 5 ? "Em estoque" : "Últimas " + estoque + " unidades")
        : '<i class="bi bi-x-circle-fill"></i> Esgotado'
    corpo.append(status)

    const acoes = criarElemento("div", "product-actions")
    const adicionar = criarElemento("button", "btn-add-cart")
    adicionar.type = "button"
    adicionar.innerHTML = '<i class="bi bi-bag-plus"></i> Adicionar'
    adicionar.disabled = estoque <= 0
    adicionar.addEventListener("click", () => {
        adicionarAoCarrinho(produto, 1)
        mostrarToast("Produto adicionado ao carrinho!", "success")
        marcarProdutoAdicionado(adicionar)
    })
    const detalhes = document.createElement("a")
    detalhes.className = "btn-detail"
    detalhes.href = link
    detalhes.setAttribute("aria-label", "Ver detalhes de " + produto.nome)
    detalhes.innerHTML = '<i class="bi bi-arrow-right"></i>'
    acoes.append(adicionar, detalhes)
    corpo.append(acoes)

    card.append(media, corpo)
    return card
}

function criarSkeletonCard() {
    const card = criarElemento("div", "skeleton-card")
    card.innerHTML = `
        <div class="skeleton sk-img"></div>
        <div class="sk-body">
            <div class="skeleton sk-line curta"></div>
            <div class="skeleton sk-line media"></div>
            <div class="skeleton sk-line"></div>
            <div class="skeleton sk-line alta"></div>
        </div>`
    return card
}

function preencherSkeletons(container, quantidade = 10) {
    container.replaceChildren()
    for (let i = 0; i < quantidade; i++) container.append(criarSkeletonCard())
}

function debounce(funcao, espera = 400) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => funcao(...args), espera)
    }
}

window.addEventListener("storage", event => {
    if (event.key === CHAVE_CARRINHO) atualizarBadgeCarrinho()
})
