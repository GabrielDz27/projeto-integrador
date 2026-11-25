BEGIN;

-- 30 clientes, com alguns inativos para exercitar filtros e status.
INSERT INTO cliente (nome, cpf, email, telefone, endereco, cidade, estado, cep, ativo)
SELECT
    'Cliente Teste SCM ' || lpad(n::text, 2, '0'),
    '900000000' || lpad(n::text, 2, '0'),
    'cliente-teste-' || lpad(n::text, 2, '0') || '@scm.local',
    '4799607' || lpad(n::text, 4, '0'),
    'Rua de Teste, ' || (100 + n),
    CASE WHEN n % 2 = 0 THEN 'Florianopolis' ELSE 'Sao Jose' END,
    'SC',
    '8800' || lpad(n::text, 4, '0'),
    n % 7 <> 0
FROM generate_series(1, 30) AS series(n)
WHERE NOT EXISTS (
    SELECT 1 FROM cliente c
    WHERE c.cpf = '900000000' || lpad(n::text, 2, '0')
       OR c.email = 'cliente-teste-' || lpad(n::text, 2, '0') || '@scm.local'
);

-- 30 fornecedores, incluindo registros ativos e inativos.
INSERT INTO fornecedor (razao_social, nome_fantasia, cnpj, email, telefone, endereco, cidade, estado, cep, ativo)
SELECT
    'Fornecedor Teste SCM ' || lpad(n::text, 2, '0'),
    'Fornecedor Teste ' || lpad(n::text, 2, '0'),
    '90000000' || '0001' || lpad(n::text, 2, '0'),
    'fornecedor-teste-' || lpad(n::text, 2, '0') || '@scm.local',
    '4799608' || lpad(n::text, 4, '0'),
    'Avenida de Teste, ' || (200 + n),
    CASE WHEN n % 2 = 0 THEN 'Florianopolis' ELSE 'Palhoca' END,
    'SC',
    '8810' || lpad(n::text, 4, '0'),
    n % 9 <> 0
FROM generate_series(1, 30) AS series(n)
WHERE NOT EXISTS (
    SELECT 1 FROM fornecedor f
    WHERE f.cnpj = '90000000' || '0001' || lpad(n::text, 2, '0')
);

-- Catálogo de serviços para preencher a tela de serviços.
INSERT INTO servico (nome, descricao, preco_base, aliquota_iss, ativo)
SELECT dados.nome, dados.descricao, dados.preco_base, dados.aliquota_iss, dados.ativo
FROM (VALUES
    ('Emissao de nota fiscal', 'Emissao e conferencia de NFS-e.', 45.00::numeric, 2.00::numeric, TRUE),
    ('Organizacao financeira', 'Organizacao mensal de receitas e despesas.', 180.00::numeric, 0.00::numeric, TRUE),
    ('Declaracao anual MEI', 'Preparacao da declaracao anual do MEI.', 120.00::numeric, 0.00::numeric, TRUE),
    ('Regularizacao cadastral', 'Apoio para atualizacao de dados cadastrais.', 95.00::numeric, 2.50::numeric, TRUE),
    ('Consultoria tributaria', 'Orientacao tributaria para microempreendedor.', 220.00::numeric, 3.00::numeric, TRUE),
    ('Abertura de empresa', 'Apoio no processo de formalizacao.', 250.00::numeric, 2.00::numeric, TRUE),
    ('Controle de obrigacoes', 'Acompanhamento de guias e vencimentos.', 150.00::numeric, 0.00::numeric, TRUE),
    ('Cadastro de cliente', 'Organizacao da base cadastral de clientes.', 60.00::numeric, 2.00::numeric, TRUE),
    ('Relatorio de faturamento', 'Consolidacao de receitas por competencia.', 85.00::numeric, 2.00::numeric, TRUE),
    ('Atendimento avulso', 'Atendimento administrativo sob demanda.', 70.00::numeric, 2.00::numeric, FALSE),
    ('Planejamento mensal', 'Planejamento de fluxo de caixa mensal.', 135.00::numeric, 0.00::numeric, TRUE),
    ('Revisao documental', 'Conferencia de documentos fiscais e cadastrais.', 110.00::numeric, 2.50::numeric, TRUE)
) AS dados(nome, descricao, preco_base, aliquota_iss, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM servico s WHERE s.nome = dados.nome
);

-- Um historico demonstrativo por cliente, sem repetir ao executar novamente.
INSERT INTO historico_cliente (
    id_cliente, tipo_operacao, campo_alterado, valor_anterior, valor_novo, usuario, observacao
)
SELECT
    c.id_cliente,
    'INCLUSAO',
    'cliente',
    NULL,
    c.nome,
    'seed@scm.local',
    'Registro demonstrativo carregado pela massa de dados do SCM.'
FROM cliente c
WHERE c.email LIKE 'cliente-teste-%@scm.local'
  AND NOT EXISTS (
      SELECT 1 FROM historico_cliente h
      WHERE h.id_cliente = c.id_cliente
        AND h.tipo_operacao = 'INCLUSAO'
        AND h.usuario = 'seed@scm.local'
  );

-- 30 lancamentos distribuidos por cliente e competencia, com status e NFS-e variados.
INSERT INTO lancamento (descricao, id_cliente, valor, data_competencia, status_recebimento, nota_fiscal_emitida)
SELECT
    'TESTE SCM - Lancamento ' || lpad(n::text, 2, '0'),
    c.id_cliente,
    (250 + n * 125)::numeric(10,2),
    (date_trunc('month', CURRENT_DATE)::date - ((n - 1) * interval '1 month'))::date,
    CASE WHEN n % 2 = 0 THEN 'PENDENTE' ELSE 'PAGO' END,
    n % 3 <> 0
FROM generate_series(1, 30) AS series(n)
JOIN cliente c
  ON c.email = 'cliente-teste-' || lpad(n::text, 2, '0') || '@scm.local'
WHERE NOT EXISTS (
    SELECT 1 FROM lancamento l
    WHERE l.descricao = 'TESTE SCM - Lancamento ' || lpad(n::text, 2, '0')
);

-- Mantem as guias sem vinculo do exemplo original.
INSERT INTO guia_das (
    periodo_apuracao, numero_documento, data_geracao, data_vencimento,
    data_pagamento, valor_principal, valor_total, status, observacao
)
SELECT
    to_char(mes.competencia, 'YYYY-MM'),
    'SCM-TESTE-GUIA-' || lpad(n::text, 2, '0'),
    CURRENT_DATE,
    (mes.competencia + interval '1 month 19 days')::date,
    CASE WHEN n % 2 = 0 THEN NULL ELSE LEAST(CURRENT_DATE, (mes.competencia + interval '1 month 17 days')::date) END,
    (75.90 + n * 3.25)::numeric(15,2),
    (75.90 + n * 3.25)::numeric(15,2),
    CASE WHEN n % 2 = 0 THEN 'PENDENTE' ELSE 'PAGO' END,
    'Dado demonstrativo para teste do SCM'
FROM generate_series(1, 10) AS series(n)
CROSS JOIN LATERAL (
    SELECT (date_trunc('month', CURRENT_DATE)::date - ((n - 1) * interval '1 month'))::date AS competencia
) AS mes
WHERE NOT EXISTS (
    SELECT 1 FROM guia_das g
    WHERE g.numero_documento = 'SCM-TESTE-GUIA-' || lpad(n::text, 2, '0')
);

-- 30 guias vinculadas a clientes para demonstrar filtros, dashboard e proxima obrigacao.
-- A primeira fica pendente com vencimento futuro; as demais distribuem status no historico.
INSERT INTO guia_das (
    periodo_apuracao, numero_documento, data_geracao, data_vencimento,
    data_pagamento, valor_principal, valor_total, status, observacao, id_cliente
)
SELECT
    to_char(mes.competencia, 'YYYY-MM'),
    'SCM-SEED-VINC-' || lpad(n::text, 2, '0'),
    mes.competencia,
    (mes.competencia + interval '1 month 19 days')::date,
    CASE
        WHEN n = 1 OR n % 2 = 0 THEN NULL
        ELSE (mes.competencia + interval '1 month 17 days')::date
    END,
    (82.50 + n * 4.10)::numeric(15,2),
    (82.50 + n * 4.10)::numeric(15,2),
    CASE WHEN n = 1 OR n % 2 = 0 THEN 'PENDENTE' ELSE 'PAGO' END,
    'Guia demonstrativa vinculada ao cliente de teste.',
    c.id_cliente
FROM generate_series(1, 30) AS series(n)
JOIN cliente c
  ON c.email = 'cliente-teste-' || lpad(n::text, 2, '0') || '@scm.local'
CROSS JOIN LATERAL (
    SELECT (date_trunc('month', CURRENT_DATE)::date - ((n - 1) * interval '1 month'))::date AS competencia
) AS mes
WHERE NOT EXISTS (
    SELECT 1 FROM guia_das g
    WHERE g.numero_documento = 'SCM-SEED-VINC-' || lpad(n::text, 2, '0')
);

COMMIT;

SELECT 'clientes' AS categoria, count(*) AS registros
FROM cliente
WHERE email LIKE 'cliente-teste-%@scm.local'
UNION ALL
SELECT 'fornecedores', count(*)
FROM fornecedor
WHERE cnpj LIKE '900000000001__'
UNION ALL
SELECT 'servicos', count(*)
FROM servico
WHERE nome IN (
    'Emissao de nota fiscal', 'Organizacao financeira', 'Declaracao anual MEI',
    'Regularizacao cadastral', 'Consultoria tributaria', 'Abertura de empresa',
    'Controle de obrigacoes', 'Cadastro de cliente', 'Relatorio de faturamento',
    'Atendimento avulso', 'Planejamento mensal', 'Revisao documental'
)
UNION ALL
SELECT 'lancamentos', count(*)
FROM lancamento
WHERE descricao LIKE 'TESTE SCM - Lancamento %'
UNION ALL
SELECT 'obrigacoes DAS sem vinculo', count(*)
FROM guia_das
WHERE numero_documento LIKE 'SCM-TESTE-GUIA-%'
UNION ALL
SELECT 'obrigacoes DAS vinculadas', count(*)
FROM guia_das
WHERE numero_documento LIKE 'SCM-SEED-VINC-%'
UNION ALL
SELECT 'historicos de cliente', count(*)
FROM historico_cliente
WHERE usuario = 'seed@scm.local';
