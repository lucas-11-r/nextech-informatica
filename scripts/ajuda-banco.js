// Traduz os erros mais comuns de conexão com o MySQL em dicas práticas.
// Usado por migration.js, scripts/criar-banco.js e scripts/testar-banco.js.

function dicasBanco(error) {
    if (!error) return []

    const host = process.env.DB_HOST || "127.0.0.1"
    const porta = process.env.DB_PORT || 3306

    switch (error.code) {
        case "ER_ACCESS_DENIED_ERROR":
            return [
                "O MySQL recusou o usuário/senha do .env.",
                "Confira DB_USER e DB_PASSWORD (a senha do MySQL, não a do site).",
                "Se o root usa autenticação do sistema, crie um usuário próprio:",
                "  CREATE USER 'nextech'@'localhost' IDENTIFIED BY 'sua_senha';",
                "  GRANT ALL PRIVILEGES ON nextech.* TO 'nextech'@'localhost';"
            ]
        case "ECONNREFUSED":
            return [
                "O MySQL não está aceitando conexões em " + host + ":" + porta + ".",
                "Verifique se o serviço está rodando e se DB_HOST/DB_PORT estão corretos."
            ]
        case "ENOTFOUND":
            return ["O host '" + host + "' não foi encontrado. Confira DB_HOST no .env."]
        case "ER_BAD_DB_ERROR":
            return ["O banco ainda não existe. Rode: npm run db:create"]
        case "ETIMEDOUT":
            return ["A conexão com " + host + ":" + porta + " expirou. Confira a rede e o firewall."]
        default:
            return []
    }
}

function imprimirDicas(error) {
    const dicas = dicasBanco(error)
    dicas.forEach(dica => console.error("  • " + dica))
}

module.exports = { dicasBanco, imprimirDicas }
