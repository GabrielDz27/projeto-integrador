CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USUÁRIO
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
    ativo BOOLEAN DEFAULT TRUE
);

-- 2. CLIENTE
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

-- 3. SERVIÇO (NOVA TABELA SOLICITADA)
CREATE TABLE IF NOT EXISTS servico (
    id_servico UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_base DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    aliquota_iss DECIMAL(5,2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS contas_pagar (
    id_conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(200) NOT NULL,
    fornecedor VARCHAR(150),
    categoria VARCHAR(100),
    valor DECIMAL(10,2) NOT NULL,
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    forma_pagamento VARCHAR(50),
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_conta_pagar (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_conta UUID NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    observacao TEXT,
    CONSTRAINT fk_item_conta_pagar FOREIGN KEY (id_conta) REFERENCES contas_pagar(id_conta) ON DELETE CASCADE
);

-- 5. CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS contas_receber (
    id_conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente UUID NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    forma_recebimento VARCHAR(50),
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conta_receber_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS item_conta_receber (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_conta UUID NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade DECIMAL(10,2) DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    acrescimo DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    observacao TEXT,
    CONSTRAINT fk_item_conta_receber FOREIGN KEY (id_conta) REFERENCES contas_receber(id_conta) ON DELETE CASCADE
);

-- 6. HISTÓRICO CLIENTE
CREATE TABLE IF NOT EXISTS historico_cliente (
    id_historico UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente UUID NOT NULL,
    tipo_operacao VARCHAR(20) NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario VARCHAR(100),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    CONSTRAINT fk_historico_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 7. GUIA DAS
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
    status VARCHAR(20) DEFAULT 'PENDENTE',
    forma_pagamento VARCHAR(50),
    codigo_barras VARCHAR(100),
    linha_digitavel VARCHAR(100),
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
