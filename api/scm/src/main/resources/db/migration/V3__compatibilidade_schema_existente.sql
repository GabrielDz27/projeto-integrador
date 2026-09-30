CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE cliente ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150),
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20),
    endereco VARCHAR(200),
    cidade VARCHAR(100),
    estado CHAR(2),
    cep VARCHAR(9),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historico_cliente (
    id_historico UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cliente UUID NOT NULL REFERENCES cliente(id_cliente),
    tipo_operacao VARCHAR(20) NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario VARCHAR(100),
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT
);

CREATE INDEX IF NOT EXISTS idx_historico_cliente_data
    ON historico_cliente (id_cliente, data_hora DESC);