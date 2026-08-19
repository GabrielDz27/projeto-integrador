CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpf VARCHAR(11),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE,
    telefone VARCHAR(11),
    cep VARCHAR(8),
    estado VARCHAR(2),
    cidade VARCHAR(150),
    username VARCHAR(50) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    ativo BOOLEAN
    );

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(150) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco VARCHAR(200),
    cidade VARCHAR(100),
    estado CHAR(2),
    cep VARCHAR(9),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS contas_pagar (
    id_conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(200) NOT NULL,
    fornecedor VARCHAR(150),
    categoria VARCHAR(100),
    valor DECIMAL(10,2) NOT NULL,
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status ENUM('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    forma_pagamento VARCHAR(50),
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS item_conta_pagar (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_conta INT NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    observacao TEXT,
    CONSTRAINT fk_item_conta_pagar FOREIGN KEY (id_conta) REFERENCES contas_pagar(id_conta)
    );

CREATE TABLE IF NOT EXISTS contas_receber (
    id_conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente INT NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status ENUM('PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    forma_recebimento VARCHAR(50),
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conta_receber_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    );

CREATE TABLE IF NOT EXISTS item_conta_receber (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_conta INT NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    acrescimo DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    observacao TEXT,
    CONSTRAINT fk_item_conta_receber FOREIGN KEY (id_conta) REFERENCES contas_receber(id_conta)
    );

CREATE TABLE IF NOT EXISTS nota_fiscal_venda (
    id_nota UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente INT NOT NULL,
    numero_nota INT NOT NULL,
    serie VARCHAR(10) NOT NULL,
    chave_acesso VARCHAR(44) UNIQUE,
    data_emissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    natureza_operacao VARCHAR(100) NOT NULL DEFAULT 'VENDA',
    valor_produtos DECIMAL(15,2) DEFAULT 0.00,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    valor_frete DECIMAL(15,2) DEFAULT 0.00,
    valor_seguro DECIMAL(15,2) DEFAULT 0.00,
    valor_outros DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('RASCUNHO', 'EMITIDA', 'CANCELADA', 'DENEGADA') DEFAULT 'RASCUNHO',
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_numero_serie UNIQUE (numero_nota, serie)
    );

CREATE TABLE IF NOT EXISTS item_nota_fiscal_venda (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_nota INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    valor_unitario DECIMAL(15,2) NOT NULL,
    desconto DECIMAL(15,2) DEFAULT 0.00,
    acrescimo DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_item_venda_nota FOREIGN KEY (id_nota) REFERENCES nota_fiscal_venda(id_nota) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS historico_cliente (
    id_historico UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente INT NOT NULL,
    tipo_operacao ENUM('INCLUSAO', 'ALTERACAO', 'EXCLUSAO') NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario VARCHAR(100),
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    CONSTRAINT fk_historico_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    );

CREATE TABLE IF NOT EXISTS nota_fiscal_entrada (
    id_nota UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_fornecedor INT NOT NULL,
    numero_nota INT NOT NULL,
    serie VARCHAR(10) NOT NULL,
    chave_acesso VARCHAR(44) UNIQUE,
    data_emissao DATETIME,
    data_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    natureza_operacao VARCHAR(100) NOT NULL DEFAULT 'COMPRA',
    valor_produtos DECIMAL(15,2) DEFAULT 0.00,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    valor_frete DECIMAL(15,2) DEFAULT 0.00,
    valor_seguro DECIMAL(15,2) DEFAULT 0.00,
    valor_outros DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('PENDENTE', 'RECEBIDA', 'CANCELADA', 'DENEGADA') DEFAULT 'PENDENTE',
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nota_entrada_fornecedor FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    CONSTRAINT uk_numero_serie_fornecedor UNIQUE (id_fornecedor, numero_nota, serie)
    );

CREATE TABLE IF NOT EXISTS item_nota_fiscal_entrada (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_nota INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    valor_unitario DECIMAL(15,2) NOT NULL,
    desconto DECIMAL(15,2) DEFAULT 0.00,
    frete DECIMAL(15,2) DEFAULT 0.00,
    outras_despesas DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_item_entrada_nota FOREIGN KEY (id_nota) REFERENCES nota_fiscal_entrada(id_nota),
    CONSTRAINT fk_item_entrada_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
    );

CREATE TABLE IF NOT EXISTS nota_fiscal_saida (
    id_nota UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente INT NOT NULL,
    numero_nota INT NOT NULL,
    serie VARCHAR(10) NOT NULL,
    chave_acesso VARCHAR(44) UNIQUE,
    data_emissao DATETIME,
    natureza_operacao VARCHAR(100) NOT NULL DEFAULT 'VENDA',
    finalidade ENUM('NORMAL', 'DEVOLUCAO', 'COMPLEMENTAR', 'AJUSTE') DEFAULT 'NORMAL',
    valor_produtos DECIMAL(15,2) DEFAULT 0.00,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    valor_frete DECIMAL(15,2) DEFAULT 0.00,
    valor_seguro DECIMAL(15,2) DEFAULT 0.00,
    valor_outros DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('RASCUNHO', 'EMITIDA', 'CANCELADA', 'DENEGADA') DEFAULT 'RASCUNHO',
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nota_saida_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    CONSTRAINT uk_numero_serie_saida UNIQUE (numero_nota, serie)
    );

CREATE TABLE IF NOT EXISTS item_nota_fiscal_saida (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_nota INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    valor_unitario DECIMAL(15,2) NOT NULL,
    desconto DECIMAL(15,2) DEFAULT 0.00,
    frete DECIMAL(15,2) DEFAULT 0.00,
    seguro DECIMAL(15,2) DEFAULT 0.00,
    outras_despesas DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_item_saida_nota FOREIGN KEY (id_nota) REFERENCES nota_fiscal_saida(id_nota) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_item_saida_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
    );

CREATE TABLE IF NOT EXISTS guia_das (
    id_guia UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    periodo_apuracao CHAR(7) NOT NULL,
    numero_documento VARCHAR(30),
    data_geracao DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_principal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    valor_multa DECIMAL(15,2) DEFAULT 0.00,
    valor_juros DECIMAL(15,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    forma_pagamento VARCHAR(50),
    codigo_barras VARCHAR(100),
    linha_digitavel VARCHAR(100),
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );