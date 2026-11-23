const CUPOM_VALIDO = "NEXTECH10"
const DESCONTO_CUPOM = 0.10
const FRETE_GRATIS_A_PARTIR = 299
const VALOR_FRETE = 29.90

const CHAVE_CHECKOUT = "nextech_checkout"
const VIACEP_URL = "https://viacep.com.br/ws/"
const UFS_VALIDAS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")
const CAMPOS_ENTREGA = {
    cep: "checkout-cep",
    endereco: "checkout-endereco",
    numero: "checkout-numero",
    complemento: "checkout-complemento",
    bairro: "checkout-bairro",
    cidade: "checkout-cidade",
    uf: "checkout-uf"
}

const ROTULOS_PAGAMENTO = {
    pix: "PIX",
    cartao: "Cartão de crédito",
    boleto: "Boleto bancário"
}

const estadoCarrinho = {
    cupom: "",
    desconto: 0
}

const estadoCep = { digitos: "", encontrado: null, consultando: false, falhaRede: false }
const cacheCep = new Map()
let consultaCepAtual = 0

function getDadosEntrega() {
    try {
        const bruto = typeof lerArmazenamento === "function"
            ? lerArmazenamento(CHAVE_CHECKOUT)
            : localStorage.getItem(CHAVE_CHECKOUT)
        const dados = JSON.parse(bruto || "{}")
        return dados && typeof dados === "object" ? dados : {}
    } catch {
        return {}
    }
}

function salvarDadosEntrega(dados) {
    const valor = JSON.stringify(dados)

    if (typeof gravarArmazenamento === "function") {
        gravarArmazenamento(CHAVE_CHECKOUT, valor)
        return
    }

    try {
        localStorage.setItem(CHAVE_CHECKOUT, valor)
    } catch {

    }
}

function digitosCep(valor) {
    return String(valor === undefined || valor === null ? "" : valor).replace(/\D/g, "").slice(0, 8)
}

function limparEstadoCep() {
    estadoCep.digitos = ""
    estadoCep.encontrado = null
    estadoCep.consultando = false
    estadoCep.falhaRede = false
}

function obterStatusCep() {
    let status = document.getElementById("checkout-cep-status")
    const campo = document.getElementById("checkout-cep")

    if (!status && campo) {
        status = document.createElement("div")
        status.id = "checkout-cep-status"
        status.className = "texto-muted"
        status.style.cssText = "font-size:11px;min-height:14px;margin-top:3px"
        campo.insertAdjacentElement("afterend", status)
    }

    return status
}

function mostrarStatusCep(status, mensagem, tipo) {
    if (!status) return
    status.textContent = mensagem || ""
    status.classList.toggle("text-danger", tipo === "erro")
}

function preencherCamposEndereco(dados) {
    const valores = {
        "checkout-endereco": dados.logradouro,
        "checkout-bairro": dados.bairro,
        "checkout-cidade": dados.localidade,
        "checkout-uf": dados.uf
    }

    Object.entries(valores).forEach(([id, valor]) => {
        const campo = document.getElementById(id)
        if (campo && valor) campo.value = valor
    })
}

async function buscarEnderecoPorCep(cep) {
    let controle = null
    let temporizador = null

    try {
        if (typeof AbortController === "function") {
            controle = new AbortController()
            temporizador = setTimeout(() => controle.abort(), 6000)
        }

        const opcoes = controle ? { signal: controle.signal } : undefined
        const resposta = await fetch(VIACEP_URL + cep + "/json/", opcoes)
        if (!resposta.ok) throw new Error("Falha na consulta do CEP")
        const dados = await resposta.json()
        if (dados && dados.erro) return { encontrado: false }
        return { encontrado: true, dados }
    } catch {
        return { falhaRede: true }
    } finally {
        if (temporizador) clearTimeout(temporizador)
    }
}

async function consultarCep(campo, status) {
    if (!campo) return

    const digitos = digitosCep(campo.value)
    if (digitos.length !== 8) {
        consultaCepAtual++
        limparEstadoCep()
        mostrarStatusCep(status, "")
        return
    }

    const sequencia = ++consultaCepAtual
    estadoCep.digitos = digitos
    estadoCep.encontrado = null
    estadoCep.consultando = true
    estadoCep.falhaRede = false
    mostrarStatusCep(status, "Buscando endereço...")

    let resultado = cacheCep.get(digitos)
    if (!resultado) {
        resultado = await buscarEnderecoPorCep(digitos)
        if (!resultado.falhaRede) cacheCep.set(digitos, resultado)
    }

    if (sequencia !== consultaCepAtual || digitosCep(campo.value) !== digitos) return

    estadoCep.consultando = false

    if (resultado.falhaRede) {
        estadoCep.falhaRede = true
        mostrarStatusCep(status, "Não foi possível consultar o CEP. Preencha o endereço manualmente.")
        return
    }

    if (!resultado.encontrado) {
        estadoCep.encontrado = false
        campo.classList.add("is-invalid")
        mostrarStatusCep(status, "CEP não encontrado. Confira os dígitos informados.", "erro")
        return
    }

    estadoCep.encontrado = true
    preencherCamposEndereco(resultado.dados)
    mostrarStatusCep(status, "Endereço encontrado.")
}

const consultarCepDebounce = typeof debounce === "function"
    ? debounce((campo, status) => consultarCep(campo, status), 350)
    : null

async function sincronizarItensComCatalogo() {
    const itens = getCarrinho()
    if (!itens.length) return

    const foraDeEstoque = []
    const removidos = []
    let mudou = false

    const atualizados = (await Promise.all(itens.map(async item => {
        try {
            const produto = await apiGet("/produtos/" + item.id)
            const estoque = Number(produto.estoque) || 0

            if (estoque <= 0) {
                foraDeEstoque.push(produto.nome)
                mudou = true
                return null
            }

            const quantidade = Math.min(Number(item.qtd || 1), estoque)
            const imagem = urlImagem(produto)

            if (
                item.nome !== produto.nome ||
                Number(item.preco) !== Number(produto.preco) ||
                Number(item.estoque) !== estoque ||
                Number(item.qtd) !== quantidade ||
                item.imagem_url !== imagem
            ) {
                mudou = true
            }

            return {
                ...item,
                nome: produto.nome,
                preco: Number(produto.preco),
                preco_antigo: produto.preco_antigo ? Number(produto.preco_antigo) : null,
                imagem_url: imagem,
                categoria: produto.categoria,
                marca: produto.marca,
                estoque,
                qtd: quantidade
            }
        } catch (error) {

            const naoExiste = error &&
                error.status === 404 &&
                error.dados &&
                error.dados.erro === "Produto não encontrado"

            if (naoExiste) {
                removidos.push("Produto #" + item.id)
                mudou = true
                return null
            }

            return item
        }
    }))).filter(Boolean)

    if (mudou) {
        salvarCarrinho(atualizados)
        renderizarCarrinho()
    }

    if (foraDeEstoque.length) {
        mostrarToast(
            foraDeEstoque.length === 1
                ? "O produto " + foraDeEstoque[0] + " está esgotado e saiu do carrinho."
                : "Alguns produtos estão esgotados e saíram do carrinho.",
            "warning"
        )
    }

    if (removidos.length) {
        mostrarToast(
            removidos.length === 1
                ? "Um produto não está mais no catálogo e saiu do carrinho."
                : removidos.length + " produtos não estão mais no catálogo e saíram do carrinho.",
            "warning"
        )
    }
}

function calcularResumo() {
    const itens = getCarrinho()
    const subtotal = totalCarrinho(itens)
    const desconto = subtotal * estadoCarrinho.desconto
    const frete = itens.length === 0 || subtotal >= FRETE_GRATIS_A_PARTIR ? 0 : VALOR_FRETE
    const total = Math.max(0, subtotal - desconto + frete)

    return { itens, subtotal, desconto, frete, total }
}

function atualizarSubtitulo(itens) {
    const subtitulo = document.getElementById("carrinho-subtitulo")
    if (!subtitulo) return

    const quantidade = itens.reduce((soma, item) => soma + Number(item.qtd || 1), 0)
    subtitulo.textContent = quantidade === 0
        ? "Seu carrinho está vazio."
        : quantidade + (quantidade === 1 ? " item" : " itens") + " no carrinho."
}

function renderizarVazio() {
    const container = document.getElementById("carrinho-conteudo")
    container.innerHTML = `
        <div class="empty-state mt-4">
            <i class="bi bi-bag"></i>
            <h3>Seu carrinho está vazio</h3>
            <p>Que tal explorar nossos produtos e montar o setup dos seus sonhos?</p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
                <a href="produtos.html" class="btn-nextech"><i class="bi bi-grid"></i> Ver produtos</a>
                <a href="monte-seu-pc.html" class="btn-outline-nextech"><i class="bi bi-tools"></i> Monte seu PC</a>
            </div>
        </div>`
    atualizarSubtitulo([])
}

function criarLinhaItem(item) {
    const linha = document.createElement("div")
    linha.className = "carrinho-item"

    const link = document.createElement("a")
    link.href = "produto.html?id=" + item.id
    const imagem = document.createElement("img")
    configurarImagem(imagem, item)
    link.append(imagem)

    const info = document.createElement("div")
    const titulo = document.createElement("h3")
    const linkTitulo = document.createElement("a")
    linkTitulo.href = "produto.html?id=" + item.id
    linkTitulo.textContent = item.nome
    linkTitulo.style.color = "inherit"
    titulo.append(linkTitulo)

    const meta = document.createElement("div")
    meta.className = "item-meta"
    meta.textContent = (item.marca || "NexTech") + " • " + (item.categoria || "Produto")

    const preco = document.createElement("div")
    preco.className = "item-preco"
    preco.textContent = formatarPreco(Number(item.preco) * Number(item.qtd || 1))

    const unitario = document.createElement("div")
    unitario.className = "item-meta"
    unitario.textContent = Number(item.qtd || 1) + " × " + formatarPreco(item.preco)

    info.append(titulo, meta, preco, unitario)

    const acoes = document.createElement("div")
    acoes.className = "item-acoes"

    const controle = document.createElement("div")
    controle.className = "qtd-control"

    const menos = document.createElement("button")
    menos.type = "button"
    menos.textContent = "−"
    menos.setAttribute("aria-label", "Diminuir quantidade de " + item.nome)
    menos.addEventListener("click", () => {
        alterarQuantidadeCarrinho(item.id, -1)
        renderizarCarrinho()
    })

    const campo = document.createElement("input")
    campo.type = "text"
    campo.inputMode = "numeric"
    campo.value = String(item.qtd || 1)
    campo.setAttribute("aria-label", "Quantidade de " + item.nome)
    campo.addEventListener("change", () => {
        const limite = Number(item.estoque || 999)
        const valor = Math.max(1, Math.min(Number.parseInt(campo.value, 10) || 1, limite))
        const carrinho = getCarrinho()
        const alvo = carrinho.find(produto => Number(produto.id) === Number(item.id))
        if (alvo) {
            alvo.qtd = valor
            salvarCarrinho(carrinho)
        }
        renderizarCarrinho()
    })

    const mais = document.createElement("button")
    mais.type = "button"
    mais.textContent = "+"
    mais.setAttribute("aria-label", "Aumentar quantidade de " + item.nome)
    mais.addEventListener("click", () => {
        alterarQuantidadeCarrinho(item.id, 1)
        renderizarCarrinho()
    })

    controle.append(menos, campo, mais)

    const remover = document.createElement("button")
    remover.type = "button"
    remover.className = "btn-remover"
    remover.innerHTML = '<i class="bi bi-trash3"></i> Remover'
    remover.addEventListener("click", () => {
        removerDoCarrinho(item.id)
        mostrarToast("Item removido do carrinho.", "warning")
        renderizarCarrinho()
    })

    acoes.append(controle, remover)
    linha.append(link, info, acoes)
    return linha
}

function renderizarResumo(resumo) {
    const painel = document.createElement("aside")
    painel.className = "resumo-carrinho"

    painel.innerHTML = `
        <h2>Resumo do pedido</h2>
        <div class="cupom">
            <input type="text" id="cupom-input" placeholder="Cupom de desconto" aria-label="Cupom de desconto">
            <button type="button" id="btn-cupom">Aplicar</button>
        </div>
        <div id="cupom-status" class="mb-2" style="font-size:11px"></div>
        <div class="resumo-linha"><span>Subtotal</span><span id="resumo-subtotal"></span></div>
        <div class="resumo-linha" id="linha-desconto" style="display:none">
            <span>Desconto</span><span class="texto-verde" id="resumo-desconto"></span>
        </div>
        <div class="resumo-linha">
            <span>Frete</span><span id="resumo-frete"></span>
        </div>
        <div class="resumo-totais">
            <div class="resumo-linha total"><span>Total</span><strong id="resumo-total"></strong></div>
            <div class="resumo-linha" style="font-size:11px;margin-top:2px">
                <span>ou <span id="resumo-parcelas"></span> sem juros</span>
            </div>
        </div>
        <button type="button" class="btn-nextech" id="btn-finalizar">
            <i class="bi bi-lock"></i> Finalizar compra
        </button>
        <a href="produtos.html" class="btn-outline-nextech">
            <i class="bi bi-arrow-left"></i> Continuar comprando
        </a>
        <div class="selo-seguro"><i class="bi bi-shield-check"></i> Ambiente 100% seguro</div>`

    const descontoLinha = painel.querySelector("#linha-desconto")
    const descontoValor = painel.querySelector("#resumo-desconto")
    const campoCupom = painel.querySelector("#cupom-input")
    const statusCupom = painel.querySelector("#cupom-status")

    painel.querySelector("#resumo-subtotal").textContent = formatarPreco(resumo.subtotal)
    painel.querySelector("#resumo-frete").textContent = resumo.frete === 0 ? "Grátis" : formatarPreco(resumo.frete)
    painel.querySelector("#resumo-total").textContent = formatarPreco(resumo.total)

    const parcelas = opcoesParcelamento(resumo.total)
    painel.querySelector("#resumo-parcelas").textContent =
        parcelas.vezes + "x de " + formatarPreco(parcelas.valor)

    if (resumo.desconto > 0) {
        descontoLinha.style.display = "flex"
        descontoValor.textContent = "− " + formatarPreco(resumo.desconto)
        campoCupom.value = estadoCarrinho.cupom
        statusCupom.innerHTML = '<span class="texto-verde"><i class="bi bi-check-circle-fill"></i> Cupom aplicado</span>'
    }

    painel.querySelector("#btn-cupom").addEventListener("click", () => {
        const codigo = campoCupom.value.trim().toUpperCase()

        if (!codigo) {
            estadoCarrinho.cupom = ""
            estadoCarrinho.desconto = 0
            renderizarCarrinho()
            return
        }

        if (codigo === CUPOM_VALIDO) {
            estadoCarrinho.cupom = codigo
            estadoCarrinho.desconto = DESCONTO_CUPOM
            mostrarToast("Cupom aplicado: 10% de desconto!", "success")
        } else {
            estadoCarrinho.cupom = ""
            estadoCarrinho.desconto = 0
            mostrarToast("Cupom inválido.", "danger")
        }
        renderizarCarrinho()
    })

    campoCupom.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault()
            painel.querySelector("#btn-cupom").click()
        }
    })

    painel.querySelector("#btn-finalizar").addEventListener("click", finalizarCompra)
    return painel
}

function renderizarCarrinho() {
    try {
        desenharCarrinho()
    } catch (error) {
        const container = document.getElementById("carrinho-conteudo")
        if (container) {
            container.innerHTML = `
                <div class="empty-state mt-4">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h3>Não foi possível montar o carrinho</h3>
                    <p>${escapeHtml(error.message || "Erro inesperado")}</p>
                    <button type="button" class="btn-nextech" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Recarregar página
                    </button>
                </div>`
        }
        mostrarToast("Erro ao montar o carrinho: " + error.message, "danger")
    }
}

function desenharCarrinho() {
    const resumo = calcularResumo()
    atualizarSubtitulo(resumo.itens)

    const container = document.getElementById("carrinho-conteudo")
    if (!container) return

    if (resumo.itens.length === 0) {
        renderizarVazio()
        return
    }

    container.innerHTML = `
        <div class="carrinho-grid">
            <div class="carrinho-lista" id="carrinho-lista"></div>
            <div id="carrinho-resumo"></div>
        </div>`

    const lista = document.getElementById("carrinho-lista")
    resumo.itens.forEach(item => lista.append(criarLinhaItem(item)))
    document.getElementById("carrinho-resumo").append(renderizarResumo(resumo))
}

function montarHtmlItens(itens) {
    return itens.map(item =>
        '<div class="resumo-item"><span>' + item.qtd + '× ' + escapeHtml(item.nome) + '</span><span>' +
        formatarPreco(Number(item.preco) * Number(item.qtd)) + '</span></div>'
    ).join("")
}

function montarHtmlTotais(resumo) {
    return `
        <div class="resumo-linha"><span>Subtotal</span><span>${formatarPreco(resumo.subtotal)}</span></div>
        ${resumo.desconto > 0
            ? '<div class="resumo-linha"><span>Desconto</span><span class="texto-verde">− ' + formatarPreco(resumo.desconto) + '</span></div>'
            : ""}
        <div class="resumo-linha"><span>Frete</span><span>${resumo.frete === 0 ? "Grátis" : formatarPreco(resumo.frete)}</span></div>
        <div class="resumo-linha total"><span>Total</span><strong>${formatarPreco(resumo.total)}</strong></div>`
}

function abrirModal(id) {
    const elemento = document.getElementById(id)
    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(elemento).show()
        return
    }
    elemento.classList.add("show")
    elemento.style.display = "block"
}

function preencherCheckout(resumo) {
    const nome = getNomeCliente() || "Cliente"
    const email = getEmailCliente()
    const cliente = document.getElementById("checkout-cliente")

    if (cliente) {
        cliente.innerHTML = `
            <i class="bi bi-person-check"></i>
            <span>Pedido de <strong>${escapeHtml(nome)}</strong>${email ? " • " + escapeHtml(email) : ""}</span>`
    }

    consultaCepAtual++
    limparEstadoCep()
    mostrarStatusCep(obterStatusCep(), "")

    const salvo = getDadosEntrega()

    Object.entries(CAMPOS_ENTREGA).forEach(([chave, id]) => {
        const campo = document.getElementById(id)
        if (!campo) return
        campo.value = salvo[chave] || ""
        campo.classList.remove("is-invalid")
    })

    const pagamento = salvo.pagamento || "pix"
    const radio = document.querySelector('input[name="pagamento"][value="' + pagamento + '"]')
    if (radio) radio.checked = true
    atualizarEstiloPagamento()

    document.getElementById("pedido-itens").innerHTML = montarHtmlItens(resumo.itens)
    document.getElementById("pedido-totais").innerHTML = montarHtmlTotais(resumo)
    limparAlertaCheckout()
}

function finalizarCompra() {
    const resumo = calcularResumo()

    if (resumo.itens.length === 0) {
        mostrarToast("Seu carrinho está vazio.", "warning")
        return
    }

    if (!estaLogado()) {
        const botao = document.getElementById("modal-btn-login")
        botao.href = loginUrl("carrinho.html")
        abrirModal("modal-login")
        return
    }

    preencherCheckout(resumo)
    abrirModal("modal-pedido")
}

async function registrarCompra(resumo, checkout) {
    const itens = resumo.itens.map(item => ({
        produto_id: Number(item.id),
        quantidade: Number(item.qtd || 1)
    }))

    const dados = await apiPostAuth("/compras", {
        itens,
        cupom: estadoCarrinho.cupom || undefined,
        entrega: checkout ? checkout.entrega : undefined,
        pagamento: checkout ? checkout.pagamento : undefined
    })

    return dados.compra
}

function renderizarSucesso(pedido) {
    const container = document.getElementById("carrinho-conteudo")
    const pagamento = ROTULOS_PAGAMENTO[pedido.pagamento] || "PIX"
    const entrega = pedido.entrega || {}
    const endereco = [
        entrega.endereco,
        entrega.numero,
        entrega.bairro,
        entrega.cidade,
        entrega.uf
    ].filter(Boolean).join(", ")

    container.innerHTML = `
        <div class="empty-state mt-4">
            <i class="bi bi-check-circle-fill" style="color:var(--verde)"></i>
            <h3>Pedido confirmado!</h3>
            <p>Obrigado pela compra, <strong>${escapeHtml(pedido.cliente)}</strong>. Seu pedido
               <strong>${escapeHtml(pedido.codigo)}</strong> foi registrado.</p>
            <div class="resumo-linha" style="max-width:360px;margin:0 auto 4px">
                <span>Pagamento</span><strong>${escapeHtml(pagamento)}</strong>
            </div>
            <div class="resumo-linha" style="max-width:360px;margin:0 auto 4px">
                <span>Total</span><strong>${formatarPreco(pedido.total)}</strong>
            </div>
            ${endereco ? `<p class="texto-muted" style="font-size:12px">
                <i class="bi bi-geo-alt"></i> Entrega: ${escapeHtml(endereco)}
            </p>` : ""}
            <p class="mb-4" style="font-size:12.5px">
                Você pode acompanhar o pedido em <strong>Minha conta → Meus pedidos</strong>.
            </p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
                <a href="produtos.html" class="btn-nextech"><i class="bi bi-grid"></i> Continuar comprando</a>
                <a href="perfil.html" class="btn-outline-nextech"><i class="bi bi-person"></i> Ver meus pedidos</a>
            </div>
        </div>`
    atualizarSubtitulo([])
    atualizarBadgeCarrinho()
}

function mostrarAlertaCheckout(mensagem) {
    const caixa = document.getElementById("checkout-alerta")
    if (!caixa) return
    caixa.textContent = mensagem || ""
    caixa.classList.toggle("visivel", Boolean(mensagem))
}

function limparAlertaCheckout() {
    mostrarAlertaCheckout("")
    document.querySelectorAll("#form-checkout .is-invalid").forEach(campo => {
        campo.classList.remove("is-invalid")
    })
}

function atualizarEstiloPagamento() {
    document.querySelectorAll(".pagamento-opcao").forEach(opcao => {
        const radio = opcao.querySelector('input[type="radio"]')
        opcao.classList.toggle("selecionado", Boolean(radio && radio.checked))
    })
}

function validarCheckout() {
    limparAlertaCheckout()

    const valor = id => {
        const campo = document.getElementById(id)
        return campo ? campo.value.trim() : ""
    }

    const dados = Object.fromEntries(
        Object.entries(CAMPOS_ENTREGA).map(([chave, id]) => [chave, valor(id)])
    )
    dados.cep = dados.cep.replace(/\D/g, "")
    dados.uf = dados.uf.toUpperCase()
    dados.pagamento = (document.querySelector('input[name="pagamento"]:checked') || {}).value || "pix"

    const regras = [
        [CAMPOS_ENTREGA.cep, dados.cep.length === 8, "Informe um CEP válido com 8 dígitos."],
        [CAMPOS_ENTREGA.endereco, dados.endereco.length >= 3, "Informe o endereço de entrega."],
        [CAMPOS_ENTREGA.numero, dados.numero.length > 0, "Informe o número do endereço."],
        [CAMPOS_ENTREGA.bairro, dados.bairro.length >= 2, "Informe o bairro."],
        [CAMPOS_ENTREGA.cidade, dados.cidade.length >= 2, "Informe a cidade."],
        [CAMPOS_ENTREGA.uf, UFS_VALIDAS.includes(dados.uf), "Informe uma UF válida."]
    ]

    for (const [id, valido, mensagem] of regras) {
        if (valido) continue
        const campo = document.getElementById(id)
        if (campo) {
            campo.classList.add("is-invalid")
            campo.focus()
        }
        mostrarAlertaCheckout(mensagem)
        return null
    }

    if (estadoCep.digitos === dados.cep) {
        if (estadoCep.consultando) {
            mostrarAlertaCheckout("Aguarde a consulta do CEP.")
            return null
        }
        if (estadoCep.encontrado === false) {
            const campo = document.getElementById(CAMPOS_ENTREGA.cep)
            if (campo) {
                campo.classList.add("is-invalid")
                campo.focus()
            }
            mostrarAlertaCheckout("CEP não encontrado. Confira o CEP informado.")
            return null
        }
    }

    if (!ROTULOS_PAGAMENTO[dados.pagamento]) {
        mostrarAlertaCheckout("Escolha uma forma de pagamento.")
        return null
    }

    return {
        entrega: {
            cep: dados.cep,
            endereco: dados.endereco,
            numero: dados.numero,
            complemento: dados.complemento,
            bairro: dados.bairro,
            cidade: dados.cidade,
            uf: dados.uf
        },
        pagamento: dados.pagamento
    }
}

function configurarCheckout() {
    const cep = document.getElementById(CAMPOS_ENTREGA.cep)
    const statusCep = obterStatusCep()

    if (cep) {
        cep.addEventListener("input", () => {
            const digitos = digitosCep(cep.value)
            cep.value = digitos.replace(/^(\d{5})(\d)/, "$1-$2")
            cep.classList.remove("is-invalid")

            consultaCepAtual++
            limparEstadoCep()
            mostrarStatusCep(statusCep, "")

            if (digitos.length === 8 && consultarCepDebounce) {
                consultarCepDebounce(cep, statusCep)
            }
        })

        cep.addEventListener("blur", () => {
            if (digitosCep(cep.value).length === 8) consultarCep(cep, statusCep)
        })
    }

    const uf = document.getElementById("checkout-uf")
    if (uf) {
        uf.addEventListener("input", () => {
            uf.value = uf.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2)
            uf.classList.remove("is-invalid")
        })
    }

    document.querySelectorAll("#form-checkout input").forEach(campo => {
        campo.addEventListener("input", () => {
            campo.classList.remove("is-invalid")
            mostrarAlertaCheckout("")
        })
    })

    document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
        radio.addEventListener("change", atualizarEstiloPagamento)
    })

    atualizarEstiloPagamento()
}

function configurarConfirmacao() {
    const form = document.getElementById("form-checkout")
    const botao = document.getElementById("btn-confirmar-pedido")
    if (!form || !botao) return

    let enviando = false

    form.addEventListener("submit", async event => {
        event.preventDefault()
        if (enviando) return

        const resumo = calcularResumo()
        if (!resumo.itens.length) {
            mostrarToast("Seu carrinho está vazio.", "warning")
            return
        }

        const checkout = validarCheckout()
        if (!checkout) return

        enviando = true
        botao.disabled = true
        botao.innerHTML = '<span class="spinner-nextech"></span> Registrando compra...'

        try {
            const compra = await registrarCompra(resumo, checkout)
            salvarDadosEntrega({ ...checkout.entrega, pagamento: checkout.pagamento })
            limparCarrinho()
            estadoCarrinho.cupom = ""
            estadoCarrinho.desconto = 0

            const modal = document.getElementById("modal-pedido")
            if (window.bootstrap && bootstrap.Modal) {
                bootstrap.Modal.getOrCreateInstance(modal).hide()
            }

            renderizarSucesso({
                ...compra,
                cliente: getNomeCliente() || "Cliente",
                pagamento: checkout.pagamento,
                entrega: checkout.entrega
            })
            mostrarToast("Pedido " + compra.codigo + " confirmado!", "success")
        } catch (error) {
            const sessaoInvalida = error.status === 401 || error.status === 403

            if (sessaoInvalida) {
                limparSessao()
                const modal = document.getElementById("modal-pedido")
                if (window.bootstrap && bootstrap.Modal) {
                    bootstrap.Modal.getOrCreateInstance(modal).hide()
                }
                document.getElementById("modal-btn-login").href = loginUrl("carrinho.html")
                abrirModal("modal-login")
                mostrarToast("Sua sessão expirou. Entre novamente para concluir a compra.", "warning")
            } else {
                mostrarAlertaCheckout(error.message || "Não foi possível registrar a compra.")
                mostrarToast(error.message || "Não foi possível registrar a compra.", "danger")
            }
        } finally {
            enviando = false
            botao.disabled = false
            botao.innerHTML = '<i class="bi bi-check2-circle"></i> Confirmar pedido'
        }
    })
}

configurarCheckout()
configurarConfirmacao()
renderizarCarrinho()
sincronizarItensComCatalogo()

window.addEventListener("carrinho:alterado", renderizarCarrinho)
window.addEventListener("storage", event => {
    if (event.key === "nextech_carrinho") renderizarCarrinho()
})
