ALTER TABLE guia_das
    ADD COLUMN IF NOT EXISTS id_cliente UUID;

ALTER TABLE guia_das
    ADD CONSTRAINT fk_guia_das_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente);

CREATE INDEX IF NOT EXISTS idx_guia_das_cliente_vencimento
    ON guia_das (id_cliente, data_vencimento);