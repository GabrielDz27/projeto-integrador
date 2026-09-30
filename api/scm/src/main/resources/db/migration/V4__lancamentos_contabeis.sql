CREATE TABLE IF NOT EXISTS lancamento (
    id_lancamento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(200) NOT NULL,
    id_cliente UUID NOT NULL REFERENCES cliente(id_cliente),
    valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    data_competencia DATE NOT NULL,
    status_recebimento VARCHAR(20) NOT NULL CHECK (status_recebimento IN ('PAGO', 'PENDENTE')),
    nota_fiscal_emitida BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_lancamento_competencia ON lancamento (data_competencia);
CREATE INDEX IF NOT EXISTS idx_lancamento_status ON lancamento (status_recebimento);
CREATE INDEX IF NOT EXISTS idx_guia_das_vencimento ON guia_das (data_vencimento);
