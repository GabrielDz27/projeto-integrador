CREATE INDEX IF NOT EXISTS idx_historico_cliente_data
    ON historico_cliente (id_cliente, data_hora DESC);
