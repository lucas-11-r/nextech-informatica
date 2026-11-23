const imagensDrive = require("./imagens-drive")

const produtos = [

    {
        nome: "Processador AMD Ryzen 5 5600 3.5GHz",
        descricao: "Processador de 6 núcleos e 12 threads, ótimo custo-benefício para jogos e produtividade. Cooler Wraith Stealth incluso.",
        categoria: "Processadores", marca: "AMD", preco: 769.90, preco_antigo: 884.90,
        estoque: 12, destaque: 1, avaliacao: 4.8, avaliacoes: 132, icone: "cpu", slug: "ryzen-5-5600"
    },
    {
        nome: "Processador AMD Athlon 3000G 3.5GHz",
        descricao: "2 núcleos e 4 threads com vídeo Radeon Vega 3 integrado. Opção econômica para escritório, estudo e PCs de entrada.",
        categoria: "Processadores", marca: "AMD", preco: 299.90, preco_antigo: 344.90,
        estoque: 8, destaque: 0, avaliacao: 4.4, avaliacoes: 160, icone: "cpu", slug: "athlon-3000g"
    },
    {
        nome: "Processador Intel Core i5-12400F 2.5GHz",
        descricao: "6 núcleos e 12 threads de 12ª geração, excelente para setups gamer de entrada e intermediário. Socket LGA1700.",
        categoria: "Processadores", marca: "Intel", preco: 859.90, preco_antigo: 988.90,
        estoque: 10, destaque: 1, avaliacao: 4.7, avaliacoes: 210, icone: "cpu", slug: "i5-12400f"
    },
    {
        nome: "Processador Intel Core i7-12700F 2.1GHz",
        descricao: "12 núcleos e 20 threads para criação de conteúdo, renderização e jogos em alta resolução. Socket LGA1700.",
        categoria: "Processadores", marca: "Intel", preco: 1579.90, preco_antigo: 1816.90,
        estoque: 5, destaque: 0, avaliacao: 4.8, avaliacoes: 76, icone: "cpu", slug: "i7-12700f"
    },
    {
        nome: "Processador AMD Ryzen 5 7600 3.8GHz",
        descricao: "6 núcleos e 12 threads com arquitetura Zen 4, PCIe 5.0 e memória DDR5. Ideal para plataformas AM5.",
        categoria: "Processadores", marca: "AMD", preco: 1199.90, preco_antigo: 1379.90,
        estoque: 7, destaque: 1, avaliacao: 4.9, avaliacoes: 54, icone: "cpu", slug: "ryzen-5-7600"
    },

    {
        nome: "Placa de Vídeo NVIDIA GeForce RTX 3050 8GB",
        descricao: "Ray tracing e DLSS para jogos em Full HD. 8GB GDDR6, três saídas DisplayPort e HDMI.",
        categoria: "Placas de Vídeo", marca: "NVIDIA", preco: 1389.90, preco_antigo: 1597.90,
        estoque: 6, destaque: 0, avaliacao: 4.6, avaliacoes: 88, icone: "gpu", slug: "rtx-3050"
    },
    {
        nome: "Placa de Vídeo NVIDIA GeForce RTX 4060 8GB",
        descricao: "Arquitetura Ada Lovelace, DLSS 3 e alto desempenho em 1080p com ray tracing. 8GB GDDR6.",
        categoria: "Placas de Vídeo", marca: "NVIDIA", preco: 2049.90, preco_antigo: 2356.90,
        estoque: 9, destaque: 1, avaliacao: 4.8, avaliacoes: 143, icone: "gpu", slug: "rtx-4060"
    },
    {
        nome: "Placa de Vídeo AMD Radeon RX 6600 8GB",
        descricao: "Excelente custo-benefício para 1080p, com 8GB GDDR6, FSR e suporte a múltiplos monitores.",
        categoria: "Placas de Vídeo", marca: "AMD", preco: 1359.90, preco_antigo: 1563.90,
        estoque: 7, destaque: 0, avaliacao: 4.7, avaliacoes: 97, icone: "gpu", slug: "rx-6600"
    },
    {
        nome: "Placa de Vídeo NVIDIA GeForce RTX 4070 12GB",
        descricao: "Desempenho para 1440p com ray tracing, DLSS 3 e 12GB GDDR6X. Ideal para gamers exigentes.",
        categoria: "Placas de Vídeo", marca: "NVIDIA", preco: 3899.90, preco_antigo: 4484.90,
        estoque: 4, destaque: 1, avaliacao: 4.9, avaliacoes: 61, icone: "gpu", slug: "rtx-4070"
    },
    {
        nome: "Placa de Vídeo AMD Radeon RX 7800 XT 16GB",
        descricao: "16GB GDDR6 e arquitetura RDNA 3 para jogos em 1440p e 4K. Suporte a FSR 3 e AV1.",
        categoria: "Placas de Vídeo", marca: "AMD", preco: 3999.90, preco_antigo: 4599.90,
        estoque: 3, destaque: 0, avaliacao: 4.8, avaliacoes: 34, icone: "gpu", slug: "rx-7800-xt"
    },

    {
        nome: "Placa-mãe ASUS Prime B550M-A",
        descricao: "Micro-ATX com socket AM4, DDR4, PCIe 4.0, M.2 NVMe e VRM reforçado para Ryzen 5000.",
        categoria: "Placas-mãe", marca: "ASUS", preco: 599.90, preco_antigo: 689.90,
        estoque: 8, destaque: 0, avaliacao: 4.7, avaliacoes: 120, icone: "motherboard", slug: "asus-b550m-a"
    },
    {
        nome: "Placa-mãe Gigabyte B760M DS3H",
        descricao: "Micro-ATX LGA1700 com DDR4, PCIe 4.0, dois slots M.2 e conectividade HDMI/DisplayPort.",
        categoria: "Placas-mãe", marca: "Gigabyte", preco: 849.90, preco_antigo: 976.90,
        estoque: 9, destaque: 0, avaliacao: 4.6, avaliacoes: 74, icone: "motherboard", slug: "gigabyte-b760m"
    },
    {
        nome: "Placa-mãe ASRock A620M-HDV/M.2",
        descricao: "Plataforma AM5 com DDR5, PCIe 4.0 e M.2, ideal para montagens modernas com Ryzen 7000.",
        categoria: "Placas-mãe", marca: "ASRock", preco: 689.90, preco_antigo: 792.90,
        estoque: 7, destaque: 0, avaliacao: 4.5, avaliacoes: 45, icone: "motherboard", slug: "asrock-a620m"
    },
    {
        nome: "Placa-mãe ASUS ROG Strix X670E-E",
        descricao: "ATX premium para AM5, DDR5, PCIe 5.0, Wi-Fi 6E, VRM robusto e iluminação Aura Sync.",
        categoria: "Placas-mãe", marca: "ASUS", preco: 4099.90, preco_antigo: 4714.90,
        estoque: 3, destaque: 1, avaliacao: 4.9, avaliacoes: 28, icone: "motherboard", slug: "asus-x670e"
    },

    {
        nome: "Memória Kingston Fury Beast 8GB DDR4 3200MHz",
        descricao: "Módulo de 8GB DDR4 com perfil XMP 2.0, dissipador de alumínio e alta compatibilidade.",
        categoria: "Memórias", marca: "Kingston", preco: 649.90, preco_antigo: 746.90,
        estoque: 22, destaque: 0, avaliacao: 4.8, avaliacoes: 340, icone: "ram", slug: "fury-8gb-ddr4"
    },
    {
        nome: "Memória Kingston Fury Beast 16GB DDR4 3200MHz",
        descricao: "16GB DDR4 para multitarefa e jogos, com XMP 2.0 e dissipador de alumínio de baixo perfil.",
        categoria: "Memórias", marca: "Kingston", preco: 469.90, preco_antigo: 539.90,
        estoque: 18, destaque: 1, avaliacao: 4.9, avaliacoes: 410, icone: "ram", slug: "fury-16gb-ddr4"
    },
    {
        nome: "Memória Corsair Vengeance 32GB (2x16) DDR4 3600MHz",
        descricao: "Kit dual channel de 32GB com 3600MHz, ideal para edição, streaming e jogos pesados.",
        categoria: "Memórias", marca: "Corsair", preco: 566.90, preco_antigo: 651.90,
        estoque: 8, destaque: 0, avaliacao: 4.8, avaliacoes: 87, icone: "ram", slug: "vengeance-32gb"
    },
    {
        nome: "Memória Kingston Fury Beast 16GB DDR5 5600MHz",
        descricao: "16GB DDR5 de alta frequência para plataformas Intel 12ª/13ª e AMD AM5.",
        categoria: "Memórias", marca: "Kingston", preco: 2369.90, preco_antigo: 2724.90,
        estoque: 12, destaque: 0, avaliacao: 4.7, avaliacoes: 66, icone: "ram", slug: "fury-16gb-ddr5"
    },

    {
        nome: "SSD Kingston A400 240GB SATA",
        descricao: "SSD SATA de 240GB para acelerar a inicialização do sistema e reduzir o tempo de carregamento.",
        categoria: "Armazenamento", marca: "Kingston", preco: 419.90, preco_antigo: 482.90,
        estoque: 25, destaque: 0, avaliacao: 4.6, avaliacoes: 520, icone: "ssd", slug: "a400-240gb"
    },
    {
        nome: "SSD Kingston NV2 500GB NVMe",
        descricao: "SSD NVMe PCIe 4.0 de 500GB com leituras de até 3500MB/s para resposta imediata.",
        categoria: "Armazenamento", marca: "Kingston", preco: 345.90, preco_antigo: 397.90,
        estoque: 20, destaque: 0, avaliacao: 4.8, avaliacoes: 230, icone: "ssd", slug: "nv2-500gb"
    },
    {
        nome: "SSD Samsung 980 1TB NVMe",
        descricao: "1TB NVMe PCIe 3.0 com até 3500MB/s, ideal para jogos, projetos e armazenamento rápido.",
        categoria: "Armazenamento", marca: "Samsung", preco: 609.90, preco_antigo: 700.90,
        estoque: 14, destaque: 1, avaliacao: 4.9, avaliacoes: 160, icone: "ssd", slug: "samsung-980-1tb"
    },
    {
        nome: "HD Seagate Barracuda 2TB 7200RPM",
        descricao: "HD de 2TB e 7200RPM para armazenamento em massa de arquivos, fotos e bibliotecas de jogos.",
        categoria: "Armazenamento", marca: "Seagate", preco: 469.90, preco_antigo: 539.90,
        estoque: 10, destaque: 0, avaliacao: 4.5, avaliacoes: 75, icone: "ssd", slug: "barracuda-2tb"
    },

    {
        nome: "Fonte Corsair CV550 550W 80 Plus Bronze",
        descricao: "Fonte de 550W com certificação 80 Plus Bronze, proteções elétricas e ventoinha silenciosa.",
        categoria: "Fontes", marca: "Corsair", preco: 319.90, preco_antigo: 367.90,
        estoque: 12, destaque: 0, avaliacao: 4.7, avaliacoes: 190, icone: "psu", slug: "corsair-cv550"
    },
    {
        nome: "Fonte Cooler Master MWE 650W 80 Plus Bronze",
        descricao: "650W com PFC ativo, cabos sleeved e certificação 80 Plus Bronze para setups intermediários.",
        categoria: "Fontes", marca: "Cooler Master", preco: 429.90, preco_antigo: 493.90,
        estoque: 9, destaque: 0, avaliacao: 4.6, avaliacoes: 88, icone: "psu", slug: "mwe-650w"
    },
    {
        nome: "Fonte XPG Core Reactor 750W 80 Plus Gold",
        descricao: "750W totalmente modular, 80 Plus Gold e componentes japoneses para máxima eficiência.",
        categoria: "Fontes", marca: "XPG", preco: 699.90, preco_antigo: 804.90,
        estoque: 6, destaque: 1, avaliacao: 4.9, avaliacoes: 64, icone: "psu", slug: "xpg-750w"
    },

    {
        nome: "Gabinete Redragon Wideload Lite Mid Tower",
        descricao: "Mid Tower com lateral de vidro temperado, suporte a water cooler de 240mm e três fans inclusos.",
        categoria: "Gabinetes", marca: "Redragon", preco: 329.90, preco_antigo: 378.90,
        estoque: 11, destaque: 0, avaliacao: 4.5, avaliacoes: 72, icone: "case", slug: "wideload-lite"
    },
    {
        nome: "Gabinete Lian Li Lancool 216 RGB",
        descricao: "Mid Tower premium com dois fans frontais de 160mm, vidro temperado e excelente fluxo de ar.",
        categoria: "Gabinetes", marca: "Lian Li", preco: 899.90, preco_antigo: 1034.90,
        estoque: 7, destaque: 1, avaliacao: 4.8, avaliacoes: 51, icone: "case", slug: "lancool-216"
    },
    {
        nome: "Gabinete Cooler Master NR200P Mini ITX",
        descricao: "Gabinete compacto Mini ITX com suporte a water cooler, lateral de vidro e ótimo aproveitamento interno.",
        categoria: "Gabinetes", marca: "Cooler Master", preco: 639.90, preco_antigo: 735.90,
        estoque: 5, destaque: 0, avaliacao: 4.7, avaliacoes: 39, icone: "case", slug: "nr200p"
    },

    {
        nome: "Air Cooler DeepCool AK400",
        descricao: "Cooler torre com quatro heatpipes, ventoinha de 120mm e desempenho silencioso para CPUs de até 220W.",
        categoria: "Coolers", marca: "DeepCool", preco: 149.90, preco_antigo: 171.90,
        estoque: 16, destaque: 0, avaliacao: 4.8, avaliacoes: 112, icone: "cooler", slug: "ak400"
    },
    {
        nome: "Water Cooler DeepCool LT520 240mm",
        descricao: "Radiador de 240mm com bomba de alto desempenho e iluminação ARGB para CPUs exigentes.",
        categoria: "Coolers", marca: "DeepCool", preco: 649.90, preco_antigo: 746.90,
        estoque: 6, destaque: 0, avaliacao: 4.7, avaliacoes: 48, icone: "cooler", slug: "lt520"
    },

    {
        nome: "Monitor LG 21.5\" 75Hz Full HD",
        descricao: "Monitor de 21,5 polegadas Full HD com painel IPS, 75Hz e conexões HDMI/VGA para escritório e estudo.",
        categoria: "Monitores", marca: "LG", preco: 539.90, preco_antigo: 620.90,
        estoque: 9, destaque: 0, avaliacao: 4.5, avaliacoes: 130, icone: "monitor", slug: "lg-215"
    },
    {
        nome: "Monitor AOC 24\" 144Hz Full HD",
        descricao: "Monitor gamer de 24 polegadas, 144Hz, 1ms e FreeSync para jogos competitivos.",
        categoria: "Monitores", marca: "AOC", preco: 579.90, preco_antigo: 666.90,
        estoque: 8, destaque: 1, avaliacao: 4.8, avaliacoes: 205, icone: "monitor", slug: "aoc-24-144hz"
    },
    {
        nome: "Monitor Samsung Odyssey G4 27\" 165Hz",
        descricao: "27 polegadas Full HD, 165Hz, IPS e G-Sync compatível para máxima fluidez.",
        categoria: "Monitores", marca: "Samsung", preco: 1499.90, preco_antigo: 1724.90,
        estoque: 5, destaque: 0, avaliacao: 4.9, avaliacoes: 73, icone: "monitor", slug: "odyssey-g4"
    },

    {
        nome: "Teclado Mecânico Redragon Kumara RGB",
        descricao: "Teclado mecânico ABNT2 com switches Outemu Red, iluminação RGB e estrutura resistente.",
        categoria: "Periféricos", marca: "Redragon", preco: 149.90, preco_antigo: 171.90,
        estoque: 14, destaque: 0, avaliacao: 4.7, avaliacoes: 310, icone: "keyboard", slug: "kumara-rgb"
    },
    {
        nome: "Mouse Gamer Logitech G203 RGB",
        descricao: "Mouse com sensor de 8000 DPI, seis botões programáveis e iluminação RGB Lightsync.",
        categoria: "Periféricos", marca: "Logitech", preco: 89.90, preco_antigo: 102.90,
        estoque: 22, destaque: 0, avaliacao: 4.8, avaliacoes: 420, icone: "mouse", slug: "g203"
    },
    {
        nome: "Headset Gamer HyperX Cloud Stinger 2",
        descricao: "Headset com som surround, microfone com cancelamento de ruído e espuma memory foam.",
        categoria: "Periféricos", marca: "HyperX", preco: 219.90, preco_antigo: 252.90,
        estoque: 12, destaque: 1, avaliacao: 4.7, avaliacoes: 260, icone: "headset", slug: "cloud-stinger-2"
    },
    {
        nome: "Mousepad Gamer Redragon Piscis GG",
        descricao: "Mousepad grande com superfície speed, base antiderrapante e bordas costuradas.",
        categoria: "Periféricos", marca: "Redragon", preco: 49.90, preco_antigo: 56.90,
        estoque: 30, destaque: 0, avaliacao: 4.6, avaliacoes: 180, icone: "mousepad", slug: "piscis-gg"
    },
    {
        nome: "Webcam Logitech C920s Full HD",
        descricao: "Webcam Full HD 1080p com foco automático, microfone duplo e tampa de privacidade.",
        categoria: "Periféricos", marca: "Logitech", preco: 449.90, preco_antigo: 516.90,
        estoque: 7, destaque: 0, avaliacao: 4.8, avaliacoes: 95, icone: "webcam", slug: "c920s"
    },

    {
        nome: "Notebook Lenovo IdeaPad 1 Athlon 8GB 256GB",
        descricao: "Notebook para estudo e escritório com tela Full HD de 15,6\", 8GB de RAM e SSD de 256GB.",
        categoria: "Notebooks", marca: "Lenovo", preco: 2499.90, preco_antigo: 2874.90,
        estoque: 6, destaque: 0, avaliacao: 4.4, avaliacoes: 88, icone: "laptop", slug: "ideapad-1"
    },
    {
        nome: "Notebook Gamer Acer Nitro V15 i5 RTX 4050",
        descricao: "Notebook gamer com Intel Core i5, RTX 4050 6GB, 16GB DDR5, SSD 512GB e tela 144Hz.",
        categoria: "Notebooks", marca: "Acer", preco: 5849.90, preco_antigo: 6726.90,
        estoque: 4, destaque: 1, avaliacao: 4.8, avaliacoes: 42, icone: "laptop", slug: "nitro-v15"
    },

    {
        nome: "Smartphone Samsung Galaxy A15 128GB",
        descricao: "Tela Super AMOLED de 6,5\", 128GB de armazenamento, câmera de 50MP e bateria de 5000mAh.",
        categoria: "Smartphones", marca: "Samsung", preco: 899.90, preco_antigo: 1034.90,
        estoque: 12, destaque: 0, avaliacao: 4.6, avaliacoes: 210, icone: "phone", slug: "galaxy-a15"
    },
    {
        nome: "Smartphone Motorola Edge 50 256GB",
        descricao: "Tela pOLED de 6,7\", 256GB, câmera de 50MP com OIS e carregamento TurboPower.",
        categoria: "Smartphones", marca: "Motorola", preco: 2599.90, preco_antigo: 2989.90,
        estoque: 7, destaque: 1, avaliacao: 4.8, avaliacoes: 97, icone: "phone", slug: "edge-50"
    },
    {
        nome: "Smartphone Samsung Galaxy S24 256GB",
        descricao: "Topo de linha com tela Dynamic AMOLED 120Hz, 256GB, câmera tripla e recursos de IA.",
        categoria: "Smartphones", marca: "Samsung", preco: 2929.90, preco_antigo: 3368.90,
        estoque: 5, destaque: 0, avaliacao: 4.9, avaliacoes: 60, icone: "phone", slug: "galaxy-s24"
    },

    {
        nome: "PC Escritório NexTech Office i3 8GB 256GB",
        descricao: "Computador pronto para escritório com Intel Core i3, 8GB de RAM, SSD 256GB e Windows 11 instalado.",
        categoria: "PCs Prontos", marca: "NexTech", preco: 1989.90, preco_antigo: 2287.90,
        estoque: 6, destaque: 0, avaliacao: 4.5, avaliacoes: 55, icone: "desktop", slug: "pc-office"
    },
    {
        nome: "PC Intermediário NexTech Home Ryzen 5 16GB 512GB",
        descricao: "PC versátil para home office, estudos e lazer com Ryzen 5, 16GB DDR4 e SSD NVMe de 512GB.",
        categoria: "PCs Prontos", marca: "NexTech", preco: 2999.90, preco_antigo: 3449.90,
        estoque: 5, destaque: 1, avaliacao: 4.7, avaliacoes: 48, icone: "desktop", slug: "pc-home"
    },
    {
        nome: "PC Gamer NexTech Storm RTX 4060 16GB 1TB",
        descricao: "PC gamer com Ryzen 5 5600, RTX 4060 8GB, 16GB DDR4, SSD NVMe 1TB e gabinete com RGB.",
        categoria: "PCs Prontos", marca: "NexTech", preco: 5499.90, preco_antigo: 6324.90,
        estoque: 3, destaque: 1, avaliacao: 4.9, avaliacoes: 38, icone: "desktop", slug: "pc-storm"
    },
    {
        nome: "PC Lazer NexTech Play Ryzen 5 16GB 512GB",
        descricao: "PC para jogos casuais, streaming e multimídia com Ryzen 5, 16GB e SSD de 512GB.",
        categoria: "PCs Prontos", marca: "NexTech", preco: 3199.90, preco_antigo: 3679.90,
        estoque: 5, destaque: 0, avaliacao: 4.6, avaliacoes: 29, icone: "desktop", slug: "pc-play"
    },

    {
        nome: "Instalação do Windows 11 + Drivers",
        descricao: "Instalação limpa do Windows 11, ativação, drivers atualizados e configuração inicial.",
        categoria: "Serviços", marca: "NexTech", preco: 99.90, preco_antigo: 114.90,
        estoque: 999, destaque: 0, avaliacao: 4.9, avaliacoes: 180, icone: "windows", slug: "instalacao-windows"
    },
    {
        nome: "Formatação e Otimização de PC",
        descricao: "Backup dos arquivos, formatação, instalação de programas essenciais e otimização de desempenho.",
        categoria: "Serviços", marca: "NexTech", preco: 99.90, preco_antigo: 114.90,
        estoque: 999, destaque: 0, avaliacao: 4.8, avaliacoes: 240, icone: "wrench", slug: "formatacao"
    },
    {
        nome: "Montagem de PC + Teste de Estresse",
        descricao: "Montagem completa, cable management, instalação de sistema e teste de estabilidade por 24h.",
        categoria: "Serviços", marca: "NexTech", preco: 199.90, preco_antigo: 229.90,
        estoque: 999, destaque: 1, avaliacao: 4.9, avaliacoes: 150, icone: "tools", slug: "montagem"
    }
];

module.exports = produtos.map((produto, indice) => {
    const id = indice + 1;
    const base = String(id).padStart(2, "0") + "-" + produto.slug;
    const arquivo = base + ".svg";

    const driveId = imagensDrive[arquivo] || imagensDrive[base] || null;

    return Object.freeze({
        id,
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        marca: produto.marca,
        preco: produto.preco,
        preco_antigo: produto.preco_antigo,
        estoque: produto.estoque,
        destaque: produto.destaque,
        caminho_img: "assets/img/produtos/" + arquivo,
        imagem_drive_id: driveId,
        quantidade_img: 1,
        avaliacao: produto.avaliacao,
        avaliacoes: produto.avaliacoes,
        icone: produto.icone,
        slug: produto.slug
    });
});
