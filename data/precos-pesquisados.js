const dados = {
    1:  { preco: 769.90,  estoque: 12,  status: "encontrado", fonte: "Terabyte - Ryzen 5 5600", observacao: "R$ 764,92 à vista" },
    2:  { preco: 299.90,  estoque: 8,   status: "encontrado", fonte: "Pichau - Athlon 3000G", observacao: "R$ 299,99 no PIX" },
    3:  { preco: 859.90,  estoque: 10,  status: "encontrado", fonte: "Pichau - Core i5-12400F", observacao: "R$ 859,99 no PIX" },
    4:  { preco: 1579.90, estoque: 5,   status: "encontrado", fonte: "KaBuM/Pichau - Core i7-12700F", observacao: "R$ 1.579,99 no PIX" },
    5:  { preco: 1199.90, estoque: 7,   status: "encontrado", fonte: "KaBuM - Ryzen 5 7600", observacao: "R$ 1.199,99 no PIX" },
    6:  { preco: 1389.90, estoque: 6,   status: "encontrado", fonte: "KaBuM - PCyes RTX 3050 8GB", observacao: "R$ 1.389,99 no PIX" },
    7:  { preco: 2049.90, estoque: 9,   status: "encontrado", fonte: "Pichau - PCyes RTX 4060 8GB", observacao: "R$ 2.049,99 no PIX" },
    8:  { preco: 1359.90, estoque: 7,   status: "encontrado", fonte: "Pichau - ASRock RX 6600 8GB", observacao: "R$ 1.359,99 no PIX" },
    9:  { preco: 3899.90, estoque: 4,   status: "encontrado", fonte: "Pichau - Galax RTX 4070 12GB", observacao: "R$ 3.899,99 no PIX" },
    10: { preco: 3999.90, estoque: 3,   status: "encontrado", fonte: "Pichau - PowerColor RX 7800 XT", observacao: "R$ 3.999,99 no PIX" },

    11: { preco: 599.90,  estoque: 8,   status: "encontrado", fonte: "KaBuM - ASUS Prime B550M-A", observacao: "Modelo sem Wi-Fi, à vista no PIX" },
    12: { preco: 849.90,  estoque: 9,   status: "encontrado", fonte: "Terabyte - Gigabyte B760M DS3H", observacao: "Versão DDR5 Gen5" },
    13: { preco: 689.90,  estoque: 7,   status: "encontrado", fonte: "Pichau - ASRock A620M-HDV/M.2", observacao: "Modelo exato, novo" },
    14: { preco: 4099.90, estoque: 3,   status: "encontrado", fonte: "Pichau - ROG Strix X670E-E", observacao: "Menor preço em loja oficial" },
    15: { preco: 649.90,  estoque: 22,  status: "encontrado", fonte: "KaBuM - Fury Beast 8GB DDR4", observacao: "R$ 649,99 no PIX (mercado de DDR4 elevado)" },
    16: { preco: 469.90,  estoque: 18,  status: "encontrado", fonte: "Pichau - Fury Beast 16GB DDR4", observacao: "Revisão BBA, R$ 469,98 no PIX" },
    17: { preco: 566.90,  estoque: 8,   status: "encontrado", fonte: "Pichau - Vengeance 32GB DDR4", observacao: "Kit 2x16GB DDR4-3600 C16" },
    18: { preco: 2369.90, estoque: 12,  status: "encontrado", fonte: "KaBuM - Fury Beast 16GB DDR5", observacao: "R$ 2.369,99 no PIX (DDR5 elevado)" },
    19: { preco: 419.90,  estoque: 25,  status: "encontrado", fonte: "Terabyte - Kingston A400 240GB", observacao: "R$ 419,90 à vista no PIX" },
    20: { preco: 345.90,  estoque: 20,  status: "encontrado", fonte: "Pichau - Kingston NV2 500GB", observacao: "NVMe Gen4x4, novo" },

    21: { preco: 609.90,  estoque: 14,  status: "encontrado", fonte: "Microgem - Samsung 980 1TB", observacao: "R$ 609,26 no PIX" },
    22: { preco: 469.90,  estoque: 10,  status: "encontrado", fonte: "Terabyte - Seagate Barracuda 2TB", observacao: "R$ 465,85 à vista no PIX" },
    23: { preco: 319.90,  estoque: 12,  status: "encontrado", fonte: "Terabyte - Corsair CV550", observacao: "R$ 324,61 à vista no PIX" },
    24: { preco: 429.90,  estoque: 9,   status: "encontrado", fonte: "Pichau - Cooler Master MWE 650W", observacao: "R$ 429,99 à vista no PIX" },
    25: { preco: 699.90,  estoque: 6,   status: "encontrado", fonte: "Terabyte - XPG Core Reactor 750W", observacao: "R$ 702,52 no PIX" },
    26: { preco: 329.90,  estoque: 11,  status: "encontrado", fonte: "KaBuM - Redragon Wideload Lite", observacao: "R$ 329,99 no PIX" },
    27: { preco: 899.90,  estoque: 7,   status: "encontrado", fonte: "Terabyte - Lian Li Lancool 216 RGB", observacao: "R$ 899,90" },
    28: { preco: 639.90,  estoque: 5,   status: "encontrado", fonte: "Terabyte - Cooler Master NR200P", observacao: "R$ 637,42" },
    29: { preco: 149.90,  estoque: 16,  status: "encontrado", fonte: "Pichau - DeepCool AK400", observacao: "R$ 149,99 no PIX" },
    30: { preco: 649.90,  estoque: 6,   status: "encontrado", fonte: "Terabyte - DeepCool LT520 240mm", observacao: "R$ 653,99 no PIX" },

    31: { preco: 539.90,  estoque: 9,   status: "encontrado", fonte: "KaBuM - LG 22MP410-B", observacao: "21.5\" Full HD 75Hz VA" },
    32: { preco: 579.90,  estoque: 8,   status: "encontrado", fonte: "Pichau - AOC 24G50F", observacao: "23.8\" Full HD 144Hz IPS" },
    33: { preco: 1499.90, estoque: 5,   status: "encontrado", fonte: "KaBuM - Samsung Odyssey G4", observacao: "27\" Full HD 240Hz" },
    34: { preco: 149.90,  estoque: 14,  status: "encontrado", fonte: "KaBuM - Redragon Kumara K552RGB", observacao: "Mecânico RGB ABNT2" },
    35: { preco: 89.90,   estoque: 22,  status: "encontrado", fonte: "Amazon BR - Logitech G203", observacao: "LIGHTSYNC RGB" },
    36: { preco: 219.90,  estoque: 12,  status: "encontrado", fonte: "KaBuM - HyperX Cloud Stinger 2", observacao: "R$ 219,99 no PIX" },
    37: { preco: 49.90,   estoque: 30,  status: "encontrado", fonte: "WebContinental - Redragon Piscis", observacao: "Mousepad 330x260mm" },
    38: { preco: 449.90,  estoque: 7,   status: "encontrado", fonte: "Logitech Store BR - C920s", observacao: "Full HD com tampa de privacidade" },
    39: { preco: 2499.90, estoque: 6,   status: "estimado",   fonte: "Zoom/Buscape - notebooks similares", observacao: "Sem oferta confiável do Athlon 8GB/256GB" },
    40: { preco: 5849.90, estoque: 4,   status: "encontrado", fonte: "KaBuM - Acer Nitro V15 ANV15-52", observacao: "i5-13420H, RTX 4050, 512GB" },

    41: { preco: 899.90,  estoque: 12,  status: "encontrado", fonte: "Buscapé/Extra - Galaxy A15 128GB", observacao: "Aparelho novo 4G" },
    42: { preco: 2599.90, estoque: 7,   status: "encontrado", fonte: "MobileMall - Motorola Edge 50 256GB", observacao: "Novo; ofertas mais baratas eram seminovas" },
    43: { preco: 2929.90, estoque: 5,   status: "encontrado", fonte: "Zoom/Amazon - Galaxy S24 256GB", observacao: "Unidade nova, não recondicionada" },
    44: { preco: 1989.90, estoque: 6,   status: "estimado",   fonte: "KaBuM/Pichau - componentes novos", observacao: "i3-12100 + H610 + 8GB + SSD 256GB + montagem" },
    45: { preco: 2999.90, estoque: 5,   status: "estimado",   fonte: "KaBuM/Pichau - componentes novos", observacao: "Ryzen 5 5600G + 16GB + SSD 512GB + montagem" },
    46: { preco: 5499.90, estoque: 3,   status: "estimado",   fonte: "Pichau - configs RTX 4060", observacao: "i5-12400F + RTX 4060 + 16GB + SSD 1TB" },
    47: { preco: 3199.90, estoque: 5,   status: "estimado",   fonte: "Pichau/KaBuM - componentes novos", observacao: "Ryzen 5 5600G + 16GB + SSD 512GB" },
    48: { preco: 99.90,   estoque: 999, status: "estimado",   fonte: "Técnico Curitiba / Dimasmicro", observacao: "Mão de obra, licença não inclusa" },
    49: { preco: 99.90,   estoque: 999, status: "estimado",   fonte: "ProTech / Técnico Curitiba", observacao: "Formatação com drivers e otimização" },
    50: { preco: 199.90,  estoque: 999, status: "estimado",   fonte: "Dimasmicro / Cia da Informática", observacao: "Montagem padrão com testes" }
}

function precoAntigo(preco) {
    return Math.round(preco * 1.15) - 0.10
}

module.exports = Object.fromEntries(
    Object.entries(dados).map(([id, item]) => [
        id,
        { ...item, preco_antigo: precoAntigo(item.preco) }
    ])
)
