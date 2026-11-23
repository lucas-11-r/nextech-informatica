function renderLayout() {
    const header = document.getElementById("site-header")
    const footer = document.getElementById("site-footer")

    if (header) {
        header.innerHTML = `
            <div class="topbar">
                <div class="container-nextech">
                    <div class="topbar-links">
                        <span><i class="bi bi-truck"></i> Frete grátis acima de R$ 299</span>
                        <span><i class="bi bi-shield-check"></i> Garantia de 12 meses</span>
                    </div>
                    <div class="topbar-links">
                        <a href="produtos.html?categoria=Servi%C3%A7os"><i class="bi bi-tools"></i> Serviços</a>
                        <a href="monte-seu-pc.html"><i class="bi bi-pc-display"></i> Monte seu PC</a>
                        <span><i class="bi bi-telephone"></i> (42) 99999-0000</span>
                    </div>
                </div>
            </div>
            <div class="site-header">
                <div class="container-nextech header-main">
                    <a class="brand" href="index.html" aria-label="NexTech Informática - início">
                        <img src="assets/img/logo.svg" alt="NexTech Informática">
                    </a>
                    <form class="search-form" action="produtos.html" method="get" role="search">
                        <i class="bi bi-search search-icon"></i>
                        <input type="search" name="nome" placeholder="Busque por processador, celular, PC gamer..." aria-label="Buscar produtos">
                        <button type="submit" aria-label="Buscar"><i class="bi bi-arrow-right"></i></button>
                    </form>
                    <div class="header-actions">
                        <a class="header-link oculto-mobile" href="monte-seu-pc.html">
                            <i class="bi bi-pc-display"></i><span>Monte seu PC</span>
                        </a>
                        <div id="area-conta"></div>
                        <div class="dropdown cart-group">
                            <a class="header-link cart-link" href="carrinho.html" aria-label="Abrir meu carrinho">
                                <i class="bi bi-bag"></i><span>Carrinho</span>
                                <span class="cart-count" data-cart-count style="display:none">0</span>
                            </a>
                            <button type="button" class="cart-preview-toggle" data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside" aria-expanded="false"
                                    aria-label="Ver os itens do carrinho">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end cart-mini" id="cart-mini"></div>
                        </div>
                    </div>
                </div>
                <nav class="nav-categorias" aria-label="Categorias">
                    <div class="container-nextech">
                        <a href="index.html" data-nav="home"><i class="bi bi-house-door"></i> Início</a>
                        <a href="produtos.html" data-nav="produtos"><i class="bi bi-grid"></i> Todos os produtos</a>
                        <a href="produtos.html?categoria=Processadores">Processadores</a>
                        <a href="produtos.html?categoria=Placas%20de%20V%C3%ADdeo">Placas de vídeo</a>
                        <a href="produtos.html?categoria=Smartphones">Celulares</a>
                        <a href="produtos.html?categoria=PCs%20Prontos">PCs prontos</a>
                        <a href="produtos.html?categoria=Perif%C3%A9ricos">Periféricos</a>
                        <a href="produtos.html?categoria=Servi%C3%A7os">Serviços</a>
                        <a href="monte-seu-pc.html"><i class="bi bi-tools"></i> Monte seu PC</a>
                    </div>
                </nav>
            </div>`
    }

    if (footer) {
        footer.innerHTML = `
            <footer class="site-footer">
                <div class="container-nextech">
                    <div class="footer-main">
                        <div class="footer-brand">
                            <img src="assets/img/logo.svg" alt="NexTech Informática">
                            <p>Tecnologia para trabalhar, estudar, criar e jogar. Montamos seu PC, instalamos o sistema e cuidamos de cada detalhe.</p>
                            <div class="footer-social">
                                <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                                <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                                <a href="#" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                                <a href="#" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                            </div>
                        </div>
                        <div class="footer-col">
                            <h3>Institucional</h3>
                            <a href="index.html">Quem somos</a>
                            <a href="produtos.html">Nossos produtos</a>
                            <a href="monte-seu-pc.html">Monte seu PC</a>
                            <a href="produtos.html?categoria=Servi%C3%A7os">Serviços</a>
                        </div>
                        <div class="footer-col">
                            <h3>Ajuda</h3>
                            <a href="carrinho.html">Meu carrinho</a>
                            <a href="perfil.html">Minha conta</a>
                            <a href="login.html">Entrar</a>
                            <a href="cadastro.html">Criar conta</a>
                        </div>
                        <div class="footer-col">
                            <h3>Atendimento</h3>
                            <p><i class="bi bi-telephone"></i> (42) 99999-0000</p>
                            <p><i class="bi bi-envelope"></i> contato@nextech.com.br</p>
                            <p><i class="bi bi-clock"></i> Seg. a sex., 8h às 18h</p>
                            <p><i class="bi bi-geo-alt"></i> Ponta Grossa - PR</p>
                            <div class="footer-pagamentos">
                                <span>PIX</span><span>VISA</span><span>MASTER</span><span>BOLETO</span>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <span>© ${new Date().getFullYear()} <strong>NexTech Informática</strong> — Todos os direitos reservados.</span>
                        <span>Projeto acadêmico de Desenvolvimento de Sistemas • API Node.js + MySQL</span>
                    </div>
                </div>
            </footer>`
    }

    atualizarNavbar()
    atualizarBadgeCarrinho()
    atualizarMiniCarrinho()
    marcarNavAtiva()
}

function atualizarNavbar() {
    const area = document.getElementById("area-conta")
    if (!area) return

    if (estaLogado()) {
        const nome = getNomeCliente() || "Cliente"
        const email = getEmailCliente()
        const partes = nome.trim().split(/\s+/)
        const primeiro = partes[0] || "Cliente"
        const inicial = primeiro.charAt(0).toUpperCase()
        const primeiroSeguro = escapeHtml(primeiro)
        const inicialSegura = escapeHtml(inicial)
        const nomeSeguro = escapeHtml(nome)
        const emailSeguro = escapeHtml(email)

        area.innerHTML = `
            <div class="dropdown conta-dropdown">
                <button class="btn btn-outline-nextech dropdown-toggle conta-btn" type="button"
                        data-bs-toggle="dropdown" aria-expanded="false" aria-label="Menu da minha conta">
                    <span class="perfil-avatar conta-avatar">${inicialSegura}<span class="status-online" title="Logado"></span></span>
                    <span class="conta-texto">
                        <small>Olá,</small>
                        <strong>${primeiroSeguro}</strong>
                    </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 conta-menu">
                    <li class="conta-cabecalho">
                        <span class="perfil-avatar conta-avatar grande">${inicialSegura}</span>
                        <div class="conta-dados">
                            <strong>${nomeSeguro}</strong>
                            <span>${emailSeguro || "Conta NexTech"}</span>
                            <em><i class="bi bi-check-circle-fill"></i> Você está logado</em>
                        </div>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="perfil.html"><i class="bi bi-person me-2"></i>Meu perfil</a></li>
                    <li><a class="dropdown-item" href="carrinho.html"><i class="bi bi-bag me-2"></i>Meu carrinho</a></li>
                    <li><a class="dropdown-item" href="perfil.html#pedidos-container"><i class="bi bi-receipt me-2"></i>Meus pedidos</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" type="button" id="btn-sair"><i class="bi bi-box-arrow-right me-2"></i>Sair</button></li>
                </ul>
            </div>`

        const sair = document.getElementById("btn-sair")
        if (sair) sair.addEventListener("click", sairDaConta)
    } else {
        area.innerHTML = `
            <a href="login.html" class="btn btn-outline-nextech"><i class="bi bi-person"></i> Entrar</a>
            <a href="cadastro.html" class="btn btn-nextech d-none d-lg-inline-flex">Criar conta</a>`
    }
}

async function sincronizarSessao() {
    if (!estaLogado()) return

    try {
        const cliente = await apiGetAuth("/cliente/perfil")
        if (!cliente) return
        salvarDadosCliente(cliente)
        atualizarNavbar()
    } catch (error) {
        if (error && (error.status === 401 || error.status === 403)) {
            limparSessao()
            atualizarNavbar()
        }
    }
}

function sairDaConta() {
    limparSessao()
    atualizarNavbar()
    mostrarToast("Você saiu da sua conta.", "success")
    setTimeout(() => {
        location.href = "index.html"
    }, 450)
}

function criarLinhaMiniCarrinho(item) {
    const linha = document.createElement("div")
    linha.className = "mini-item"

    const linkImagem = document.createElement("a")
    linkImagem.className = "mini-item-img"
    linkImagem.href = "produto.html?id=" + item.id
    const imagem = document.createElement("img")
    configurarImagem(imagem, item)
    linkImagem.append(imagem)

    const info = document.createElement("div")
    info.className = "mini-item-info"

    const nome = document.createElement("a")
    nome.href = "produto.html?id=" + item.id
    nome.textContent = item.nome

    const detalhes = document.createElement("span")
    detalhes.textContent = Number(item.qtd || 1) + " × " + formatarPreco(item.preco)

    info.append(nome, detalhes)

    const remover = document.createElement("button")
    remover.type = "button"
    remover.className = "mini-remover"
    remover.innerHTML = '<i class="bi bi-x-lg"></i>'
    remover.setAttribute("aria-label", "Remover " + item.nome + " do carrinho")
    remover.addEventListener("click", () => {
        removerDoCarrinho(item.id)
        atualizarMiniCarrinho()
        mostrarToast("Item removido do carrinho.", "warning")
    })

    linha.append(linkImagem, info, remover)
    return linha
}

function atualizarMiniCarrinho() {
    const menu = document.getElementById("cart-mini")
    if (!menu) return

    const itens = getCarrinho()
    menu.replaceChildren()

    if (itens.length === 0) {
        const vazio = document.createElement("div")
        vazio.className = "mini-vazio"
        vazio.innerHTML = `
            <i class="bi bi-bag"></i>
            <p>Seu carrinho está vazio.</p>
            <a href="produtos.html" class="btn-nextech"><i class="bi bi-grid"></i> Ver produtos</a>`
        menu.append(vazio)
        return
    }

    const lista = document.createElement("div")
    lista.className = "mini-lista"
    itens.forEach(item => lista.append(criarLinhaMiniCarrinho(item)))

    const rodape = document.createElement("div")
    rodape.className = "mini-rodape"

    const quantidade = itens.reduce((soma, item) => soma + Number(item.qtd || 1), 0)
    const total = totalCarrinho(itens)
    rodape.innerHTML = `
        <div class="mini-total">
            <span>${quantidade} ${quantidade === 1 ? "item" : "itens"}</span>
            <strong>${formatarPreco(total)}</strong>
        </div>
        <a href="carrinho.html" class="btn-nextech"><i class="bi bi-bag-check"></i> Ver carrinho e comprar</a>
        <span class="mini-obs"><i class="bi bi-shield-check"></i> Compra 100% segura</span>`

    menu.append(lista, rodape)
}

function marcarNavAtiva() {
    const pagina = document.body.dataset.page
    if (!pagina) return
    document.querySelectorAll("[data-nav]").forEach(link => {
        link.classList.toggle("ativo", link.dataset.nav === pagina)
    })
}

function armazenamentoLocalFunciona() {
    try {
        localStorage.setItem("__nextech_sonda__", "1")
        localStorage.removeItem("__nextech_sonda__")
        return true
    } catch {
        return false
    }
}

function avisarArmazenamento() {

    const disponivel = typeof obterArmazenamento === "function"
        ? obterArmazenamento()
        : armazenamentoLocalFunciona()

    if (disponivel) return
    if (document.getElementById("aviso-armazenamento")) return

    const aviso = document.createElement("div")
    aviso.id = "aviso-armazenamento"
    aviso.className = "aviso-armazenamento"
    aviso.setAttribute("role", "alert")
    aviso.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div>
            <strong>O navegador está bloqueando o armazenamento do login e do carrinho.</strong>
            <span>Abra o site por <a href="http://localhost:3000" target="_blank" rel="noopener">http://localhost:3000</a>
            (com o servidor rodando via <code>npm start</code>) e permita cookies/dados do site.
            Assim o carrinho e a sessão continuam ao trocar de página.</span>
        </div>
        <button type="button" aria-label="Fechar aviso"><i class="bi bi-x-lg"></i></button>`

    document.body.prepend(aviso)
    aviso.querySelector("button").addEventListener("click", () => aviso.remove())
}

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div")
        container.id = "toast-container"
        container.className = "toast-container position-fixed top-0 end-0 p-3"
        container.style.zIndex = "1090"
        document.body.append(container)
    }
})

window.addEventListener("carrinho:alterado", () => {
    atualizarBadgeCarrinho()
    atualizarMiniCarrinho()
})

window.addEventListener("storage", event => {
    if (event.key === "nextech_carrinho") atualizarMiniCarrinho()
})

window.addEventListener("sessao:alterada", atualizarNavbar)

renderLayout()
avisarArmazenamento()
sincronizarSessao()
