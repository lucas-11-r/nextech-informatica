// Mapa entre o arquivo da imagem do produto e o ID do arquivo no Google Drive.
//
// Como preencher:
// 1. Envie as imagens para uma pasta do Google Drive.
// 2. Compartilhe cada arquivo como "qualquer pessoa com o link".
// 3. Copie o ID que aparece na URL (o trecho entre /d/ e /view).
// 4. Informe o ID abaixo, usando o nome do arquivo como chave.
//
// Exemplo:
// "01-ryzen-5-5600.svg": "1AbCdEfGhIjKlMnOpQrStUvWxYz"
//
// Se o mapa estiver vazio, o servidor usa a pasta externa definida em
// IMAGENS_DIR ou a imagem genérica de fallback.

module.exports = {}
