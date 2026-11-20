// Camada de acesso à API da NexTech.
// Quando o site é aberto pelo Express (http://localhost:3000), usa a mesma origem.
// Se o HTML for aberto como arquivo, cai para http://localhost:3000.
const API_URL = location.protocol === "file:" ? "http://localhost:3000" : location.origin

// Login e carrinho ficam no localStorage, que é separado por endereço.
// Abrir o HTML como arquivo (file://) ou por outro servidor (ex.: Live Server
// na porta 5500) usa um "cofre" diferente do site em http://localhost:3000:
// o login e o carrinho parecem sumir ao trocar de página. Quando detectamos
// esse caso, levamos o visitante para o endereço oficial do site.
const PORTA_API = "3000"

function destinoDoServidor() {
    const arquivo = location.pathname.split(/[\\/]/).pop() || "index.html"
    return "http://localhost:" + PORTA_API + "/" + arquivo + location.search + location.hash
}

function servidorDaApiNoAr(origem) {
    return fetch(origem + "/health")
        .then(resposta => resposta.ok)
        .catch(() => false)
}

if (location.protocol === "file:") {
    servidorDaApiNoAr("http://localhost:" + PORTA_API).then(noAr => {
        if (noAr) location.replace(destinoDoServidor())
        // Servidor desligado: a página segue e mostra o aviso de armazenamento.
    })
} else if (/^(localhost|127\.0\.0\.1)$/i.test(location.hostname) && location.port !== PORTA_API) {
    // Página em localhost, mas servida por outra porta (Live Server, preview...).
    // Se a própria origem não tem a API, e o site oficial está no ar, vai para ele.
    servidorDaApiNoAr(location.origin).then(temApiNaOrigem => {
        if (temApiNaOrigem) return
        servidorDaApiNoAr("http://localhost:" + PORTA_API).then(noAr => {
            if (noAr) location.replace(destinoDoServidor())
        })
    })
}

async function apiFetch(caminho, opcoes = {}) {
    const resposta = await fetch(API_URL + caminho, opcoes)
    const texto = await resposta.text()
    let dados = null

    try {
        dados = texto ? JSON.parse(texto) : null
    } catch {
        dados = { erro: texto }
    }

    if (!resposta.ok) {
        const erro = new Error((dados && dados.erro) || "Erro " + resposta.status)
        erro.status = resposta.status
        erro.dados = dados
        throw erro
    }

    return dados
}

function apiGet(caminho) {
    return apiFetch(caminho)
}

function apiPost(caminho, corpo) {
    return apiFetch(caminho, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    })
}

function apiGetAuth(caminho) {
    const token = getToken()
    return apiFetch(caminho, {
        headers: token ? { Authorization: "Bearer " + token } : {}
    })
}

function apiPostAuth(caminho, corpo) {
    const token = getToken()
    return apiFetch(caminho, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {})
        },
        body: JSON.stringify(corpo || {})
    })
}

// Usa os helpers de ui.js (localStorage com fallback para sessionStorage)
// quando eles já foram carregados; senão, tenta o localStorage diretamente.
function lerArmazenamento(chave) {
    if (typeof lerDoArmazenamento === "function") return lerDoArmazenamento(chave)
    try {
        return localStorage.getItem(chave)
    } catch {
        return null
    }
}

function gravarArmazenamento(chave, valor) {
    if (typeof gravarNoArmazenamento === "function") return gravarNoArmazenamento(chave, valor)
    try {
        localStorage.setItem(chave, valor)
        return true
    } catch {
        return false
    }
}

function removerArmazenamento(chave) {
    let removido = false

    if (typeof removerDoArmazenamento === "function") {
        removido = removerDoArmazenamento(chave)
    }

    // Garante a limpeza nas duas opções de armazenamento.
    try {
        localStorage.removeItem(chave)
        removido = true
    } catch {
        // Armazenamento bloqueado.
    }
    try {
        sessionStorage.removeItem(chave)
        removido = true
    } catch {
        // Armazenamento bloqueado.
    }

    return removido
}

function getToken() {
    return lerArmazenamento("token") || null
}

function getNomeCliente() {
    return lerArmazenamento("nome_cliente") || ""
}

function getEmailCliente() {
    return lerArmazenamento("email_cliente") || ""
}

function avisarSessaoAlterada() {
    try {
        window.dispatchEvent(new CustomEvent("sessao:alterada"))
    } catch {
        // Navegadores muito antigos não têm CustomEvent.
    }
}

function salvarSessao(nome, token, email) {
    const salvouNome = gravarArmazenamento("nome_cliente", nome)
    const salvouToken = gravarArmazenamento("token", token)
    const salvouEmail = !email || gravarArmazenamento("email_cliente", email)

    // Espelha no localStorage quando ele está disponível (e ignora o bloqueio).
    try {
        localStorage.setItem("nome_cliente", nome)
        localStorage.setItem("token", token)
        if (email) localStorage.setItem("email_cliente", email)
    } catch {
        // O fallback de armazenamento já foi tratado acima.
    }

    avisarSessaoAlterada()
    return Boolean(salvouNome && salvouToken && salvouEmail)
}

// Mantém o cabeçalho atualizado com os dados confirmados pela API.
function salvarDadosCliente(cliente) {
    if (!cliente) return false

    const salvouNome = !cliente.nome || gravarArmazenamento("nome_cliente", cliente.nome)
    const salvouEmail = !cliente.email || gravarArmazenamento("email_cliente", cliente.email)

    avisarSessaoAlterada()
    return Boolean(salvouNome && salvouEmail)
}

function limparSessao() {
    removerArmazenamento("nome_cliente")
    removerArmazenamento("email_cliente")
    removerArmazenamento("token")
    avisarSessaoAlterada()
}

function estaLogado() {
    return Boolean(getToken())
}

function loginUrl(redirect) {
    const destino = redirect || (location.pathname.split("/").pop() + location.search)
    return "login.html?redirect=" + encodeURIComponent(destino)
}

function irParaLogin(redirect) {
    location.href = loginUrl(redirect)
}

function queryParams() {
    return new URLSearchParams(location.search)
}
