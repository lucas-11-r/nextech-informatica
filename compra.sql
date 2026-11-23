CREATE TABLE IF NOT EXISTS compra (
    id INT NOT NULL AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    frete DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    data_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_compra_codigo (codigo),
    KEY idx_compra_cliente (cliente_id),
    CONSTRAINT fk_compra_cliente FOREIGN KEY (cliente_id)
        REFERENCES cliente(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS compra_item (
    id INT NOT NULL AUTO_INCREMENT,
    compra_id INT NOT NULL,
    produto_id INT NOT NULL,
    nome_produto VARCHAR(200) NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_item_compra (compra_id),
    KEY idx_item_produto (produto_id),
    CONSTRAINT fk_item_compra FOREIGN KEY (compra_id)
        REFERENCES compra(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id)
        REFERENCES produto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT * FROM compra ORDER BY data_compra DESC;
SELECT c.codigo, i.nome_produto, i.quantidade, i.preco_unitario, i.subtotal
FROM compra c
INNER JOIN compra_item i ON i.compra_id = c.id
ORDER BY c.id DESC, i.id ASC;
