const fs = require("fs")
const path = require("path")
const precos = require("../data/precos-pesquisados")

const arquivo = path.join(__dirname, "..", "data", "produtos.js")
let conteudo = fs.readFileSync(arquivo, "utf8")

let indice = 0
conteudo = conteudo.replace(/preco: [\d.]+, preco_antigo: [\d.]+,/g, () => {
    indice += 1
    const item = precos[indice]
    if (!item) throw new Error("Sem preço pesquisado para o produto " + indice)
    return `preco: ${item.preco.toFixed(2)}, preco_antigo: ${item.preco_antigo.toFixed(2)},`
})

indice = 0
conteudo = conteudo.replace(/estoque: \d+,/g, () => {
    indice += 1
    const item = precos[indice]
    if (!item) throw new Error("Sem estoque pesquisado para o produto " + indice)
    return `estoque: ${item.estoque},`
})

fs.writeFileSync(arquivo, conteudo, "utf8")
console.log("Preços e estoques aplicados em " + indice + " produtos.")
