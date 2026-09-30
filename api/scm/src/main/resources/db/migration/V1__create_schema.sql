CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), cpf VARCHAR(11), nome VARCHAR(150) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE, telefone VARCHAR(11), cep VARCHAR(8), estado VARCHAR(2),
    cidade VARCHAR(150), username VARCHAR(50) NOT NULL UNIQUE, senha TEXT NOT NULL, ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nome VARCHAR(100) NOT NULL, cpf VARCHAR(14) UNIQUE,
    email VARCHAR(150) UNIQUE, telefone VARCHAR(20), data_nascimento DATE, endereco VARCHAR(200),
    cidade VARCHAR(100), estado CHAR(2), cep VARCHAR(9), ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servico (
    id_servico UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nome VARCHAR(150) NOT NULL, descricao TEXT,
    preco_base NUMERIC(10,2) NOT NULL DEFAULT 0, aliquota_iss NUMERIC(5,2) DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE, data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor UUID PRIMARY KEY DEFAULT uuid_generate_v4(), razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150), cnpj VARCHAR(14) UNIQUE NOT NULL, email VARCHAR(150), telefone VARCHAR(20),
    endereco VARCHAR(200), cidade VARCHAR(100), estado CHAR(2), cep VARCHAR(9), ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contas_pagar (
    id_conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(), descricao VARCHAR(200) NOT NULL, fornecedor VARCHAR(150),
    categoria VARCHAR(100), valor NUMERIC(10,2) NOT NULL, data_emissao DATE, data_vencimento DATE NOT NULL,
    data_pagamento DATE, status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', forma_pagamento VARCHAR(50),
    observacao TEXT, data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_conta_pagar (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(), id_conta UUID NOT NULL REFERENCES contas_pagar(id_conta) ON DELETE CASCADE,
    descricao VARCHAR(200) NOT NULL, quantidade NUMERIC(10,2) DEFAULT 1, valor_unitario NUMERIC(10,2) NOT NULL,
    desconto NUMERIC(10,2) DEFAULT 0, valor_total NUMERIC(10,2) NOT NULL, observacao TEXT
);

CREATE TABLE IF NOT EXISTS contas_receber (
    id_conta UUID PRIMARY KEY DEFAULT uuid_generate_v4(), id_cliente UUID NOT NULL REFERENCES cliente(id_cliente),
    descricao VARCHAR(200) NOT NULL, valor NUMERIC(10,2) NOT NULL, data_emissao DATE, data_vencimento DATE NOT NULL,
    data_recebimento DATE, status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', forma_recebimento VARCHAR(50),
    observacao TEXT, data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_conta_receber (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(), id_conta UUID NOT NULL REFERENCES contas_receber(id_conta) ON DELETE CASCADE,
    descricao VARCHAR(200) NOT NULL, quantidade NUMERIC(10,2) DEFAULT 1, valor_unitario NUMERIC(10,2) NOT NULL,
    desconto NUMERIC(10,2) DEFAULT 0, acrescimo NUMERIC(10,2) DEFAULT 0, valor_total NUMERIC(10,2) NOT NULL, observacao TEXT
);

CREATE TABLE IF NOT EXISTS historico_cliente (
    id_historico UUID PRIMARY KEY DEFAULT uuid_generate_v4(), id_cliente UUID NOT NULL REFERENCES cliente(id_cliente),
    tipo_operacao VARCHAR(20) NOT NULL, campo_alterado VARCHAR(100), valor_anterior TEXT, valor_novo TEXT,
    usuario VARCHAR(100), data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, observacao TEXT
);

CREATE TABLE IF NOT EXISTS guia_das (
    id_guia UUID PRIMARY KEY DEFAULT uuid_generate_v4(), periodo_apuracao CHAR(7) NOT NULL,
    numero_documento VARCHAR(30), data_geracao DATE, data_vencimento DATE NOT NULL, data_pagamento DATE,
    valor_principal NUMERIC(15,2) NOT NULL DEFAULT 0, valor_multa NUMERIC(15,2) DEFAULT 0,
    valor_juros NUMERIC(15,2) DEFAULT 0, valor_total NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', forma_pagamento VARCHAR(50), codigo_barras VARCHAR(100),
    linha_digitavel VARCHAR(100), observacao TEXT, data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
