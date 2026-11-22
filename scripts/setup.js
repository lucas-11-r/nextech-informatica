// Cria o arquivo .env a partir do modelo, sem depender de comandos do sistema.
// Uso: npm run setup
const fs = require("fs")
const path = require("path")

const origem = path.join(__dirname, "..", "dotenv-example.txt")
const destino = path.join(__dirname, "..", ".env")

if (fs.existsSync(destino)) {
    console.log(".env já existe — nada foi alterado.")
    process.exit(0)
}

fs.copyFileSync(origem, destino)
console.log(".env criado a partir de dotenv-example.txt.")
console.log("Ajuste DB_*, JWT_SECRET e GOOGLE_DRIVE_* conforme seu ambiente.")
