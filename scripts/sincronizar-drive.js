// Sincroniza os IDs das imagens do Google Drive com data/imagens-drive.js.
//
// Uso:
//   npm run drive:sync                 # usa GOOGLE_DRIVE_FOLDER_ID do .env
//   npm run drive:sync -- <link ou ID> # usa a pasta informada
//
// A pasta precisa estar compartilhada como "qualquer pessoa com o link".
// O script lê a listagem pública da pasta, casa os nomes dos arquivos com os
// produtos e reescreve data/imagens-drive.js. Depois rode `npm run migrate`
// para gravar os IDs no banco.

const fs = require("fs")
const path = require("path")
dotenv()

function dotenv() {
    try {
        require("dotenv").config({ quiet: true })
    } catch {
        // dotenv é opcional para este script.
    }
}

const ARQUIVO_MAPA = path.join(__dirname, "..", "data", "imagens-drive.js")
const EXTENSOES = /\.(png|jpe?g|webp|gif|svg)$/i
const API_KEY = String(process.env.GOOGLE_DRIVE_API_KEY || "").trim()

const PRODUTOS = require("../data/produtos")

function extrairId(entrada) {
    const texto = String(entrada || "").trim()
    if (!texto) return ""

    const porLink = texto.match(/\/folders\/([A-Za-z0-9_-]+)/)
    if (porLink) return porLink[1]

    const porParametro = texto.match(/[?&]id=([A-Za-z0-9_-]+)/)
    if (porParametro) return porParametro[1]

    return /^[A-Za-z0-9_-]{10,}$/.test(texto) ? texto : ""
}

// Lista a pasta pela API oficial do Drive (v3). Exige uma chave de API
// pública (GOOGLE_DRIVE_API_KEY) — não é necessário login, desde que a
// pasta esteja compartilhada como "qualquer pessoa com o link".
async function listarPastaApi(idPasta) {
    const arquivos = []
    let pageToken = ""

    do {
        const parametros = new URLSearchParams({
            q: "'" + idPasta + "' in parents and trashed = false",
            fields: "nextPageToken, files(id, name, mimeType)",
            pageSize: "1000",
            key: API_KEY,
            supportsAllDrives: "true",
            includeItemsFromAllDrives: "true"
        })

        if (pageToken) parametros.set("pageToken", pageToken)

        const resposta = await fetch(
            "https://www.googleapis.com/drive/v3/files?" + parametros.toString()
        )

        if (!resposta.ok) {
            const detalhe = await resposta.text()
            throw new Error(
                "A API do Drive respondeu " + resposta.status +
                ". Confira a GOOGLE_DRIVE_API_KEY e se a pasta está pública. " +
                detalhe.slice(0, 300)
            )
        }

        const dados = await resposta.json()
        for (const arquivo of dados.files || []) {
            if (EXTENSOES.test(arquivo.name)) {
                arquivos.push({ id: arquivo.id, nome: arquivo.name })
            }
        }
        pageToken = dados.nextPageToken || ""
    } while (pageToken)

    return arquivos
}

// Alternativa sem chave de API. O embeddedfolderview foi descontinuado
// pelo Google e pode devolver a página sem a listagem; nesse caso a
// mensagem abaixo orienta a configurar a chave.
async function listarPasta(idPasta) {
    const url = "https://drive.google.com/embeddedfolderview?id=" +
        encodeURIComponent(idPasta) + "#list"

    const resposta = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NexTech/1.0)" }
    })

    if (!resposta.ok) {
        throw new Error("O Google Drive respondeu " + resposta.status)
    }

    const html = await resposta.text()
    if (!/flip-entry/.test(html)) return []

    const arquivos = []

    for (const bloco of html.split('class="flip-entry"').slice(1)) {
        const id = (bloco.match(/id="entry-([A-Za-z0-9_-]+)"/) || [])[1]
        const nome = (bloco.match(/flip-entry-title[^>]*>([^<]+)</) || [])[1]

        if (id && nome && EXTENSOES.test(nome.trim())) {
            arquivos.push({ id, nome: nome.trim() })
        }
    }

    return arquivos
}

function dicaPastaVazia() {
    console.log("Nenhuma imagem encontrada.")
    console.log("1. Confira se a pasta do Drive contém os arquivos (01-....png, 02-....png, ...).")
    console.log('2. Compartilhe a pasta como "qualquer pessoa com o link" (leitor).')
    console.log("3. Recomendado: crie uma chave de API do Google Drive e defina")
    console.log("   GOOGLE_DRIVE_API_KEY no .env (o embeddedfolderview pode vir vazio).")
    console.log("   Console: https://console.cloud.google.com/apis/credentials")
    console.log("4. Alternativa: preencha data/imagens-drive.js à mão com os IDs.")
}

function escreverMapa(mapa) {
    const linhas = Object.keys(mapa)
        .sort()
        .map(chave => '    "' + chave + '": "' + mapa[chave] + '"')

    const conteudo = [
        "// Mapa entre o arquivo da imagem do produto e o ID do arquivo no Google Drive.",
        "//",
        "// Gerado por `npm run drive:sync`. Pode ser editado à mão:",
        "// a chave aceita o nome do arquivo com ou sem extensão.",
        "//",
        "// Exemplo:",
        '// "01-ryzen-5-5600": "1AbCdEfGhIjKlMnOpQrStUvWxYz"',
        "//",
        "// Se o mapa estiver vazio, o servidor usa a pasta externa definida em",
        "// IMAGENS_DIR ou a imagem genérica de fallback.",
        "",
        "module.exports = {",
        linhas.length ? linhas.join(",\n") : "",
        "}",
        ""
    ].filter((linha, indice) => linha !== "" || indice < 9).join("\n")

    fs.writeFileSync(ARQUIVO_MAPA, conteudo, "utf8")
}

async function principal() {
    const idPasta = extrairId(process.argv[2] || process.env.GOOGLE_DRIVE_FOLDER_ID)

    if (!idPasta) {
        console.error("Informe a pasta do Drive:")
        console.error("  npm run drive:sync -- https://drive.google.com/drive/folders/SEU_ID")
        console.error("ou defina GOOGLE_DRIVE_FOLDER_ID no .env")
        process.exit(1)
    }

    console.log("Lendo a pasta pública do Drive: " + idPasta)
    console.log("Método: " + (API_KEY ? "Google Drive API v3" : "embeddedfolderview (sem chave de API)"))

    const arquivos = API_KEY
        ? await listarPastaApi(idPasta)
        : await listarPasta(idPasta)

    if (arquivos.length === 0) {
        dicaPastaVazia()
        return
    }

    const porBase = new Map()
    for (const arquivo of arquivos) {
        porBase.set(arquivo.nome.replace(/\.[^.]+$/, "").toLowerCase(), arquivo)
    }

    const mapa = {}
    const encontrados = []
    const faltando = []

    for (const produto of PRODUTOS) {
        const base = String(produto.id).padStart(2, "0") + "-" + produto.slug
        const achado = porBase.get(base.toLowerCase())

        if (achado) {
            mapa[base] = achado.id
            encontrados.push(base + " (" + achado.nome + ")")
        } else {
            faltando.push(base)
        }
    }

    escreverMapa(mapa)

    console.log("Imagens vinculadas: " + encontrados.length + " de " + PRODUTOS.length)
    encontrados.slice(0, 5).forEach(item => console.log("  ✓ " + item))
    if (encontrados.length > 5) console.log("  ...")

    if (faltando.length) {
        console.log("Sem imagem na pasta:")
        faltando.forEach(base => console.log("  - " + base))
    }

    console.log("\ndata/imagens-drive.js atualizado. Rode `npm run migrate` para gravar no banco.")
}

principal().catch(erro => {
    console.error("Falha ao ler a pasta: " + erro.message)
    process.exit(1)
})
