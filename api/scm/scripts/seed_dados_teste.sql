BEGIN;

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
    TRUE
FROM generate_series(1, 10) AS series(n)
WHERE NOT EXISTS (
    SELECT 1 FROM cliente c
    WHERE c.cpf = '900000000' || lpad(n::text, 2, '0')
       OR c.email = 'cliente-teste-' || lpad(n::text, 2, '0') || '@scm.local'
);

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
    TRUE
FROM generate_series(1, 10) AS series(n)
WHERE NOT EXISTS (
    SELECT 1 FROM fornecedor f
    WHERE f.cnpj = '90000000' || '0001' || lpad(n::text, 2, '0')
);

INSERT INTO lancamento (descricao, id_cliente, valor, data_competencia, status_recebimento, nota_fiscal_emitida)
SELECT
    'TESTE SCM - Lancamento ' || lpad(n::text, 2, '0'),
    c.id_cliente,
    (250 + n * 125)::numeric(10,2),
    (date_trunc('month', CURRENT_DATE)::date - ((n - 1) * interval '1 month'))::date,
    CASE WHEN n % 2 = 0 THEN 'PENDENTE' ELSE 'PAGO' END,
    n % 3 <> 0
FROM generate_series(1, 10) AS series(n)
JOIN cliente c
  ON c.email = 'cliente-teste-' || lpad(n::text, 2, '0') || '@scm.local'
WHERE NOT EXISTS (
    SELECT 1 FROM lancamento l
    WHERE l.descricao = 'TESTE SCM - Lancamento ' || lpad(n::text, 2, '0')
);

INSERT INTO guia_das (
    periodo_apuracao, numero_documento, data_geracao, data_vencimento,
    data_pagamento, valor_principal, valor_total, status, observacao
)
SELECT
    to_char(mes.competencia, 'YYYY-MM'),
    'SCM-TESTE-GUIA-' || lpad(n::text, 2, '0'),
    CURRENT_DATE,
    (mes.competencia + interval '1 month 19 days')::date,
    CASE WHEN n % 2 = 0 THEN NULL ELSE (mes.competencia + interval '1 month 17 days')::date END,
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

COMMIT;

SELECT 'clientes' AS categoria, count(*) AS registros
FROM cliente
WHERE email LIKE 'cliente-teste-%@scm.local'
UNION ALL
SELECT 'fornecedores', count(*)
FROM fornecedor
WHERE cnpj LIKE '900000000001__'
UNION ALL
SELECT 'lancamentos', count(*)
FROM lancamento
WHERE descricao LIKE 'TESTE SCM - Lancamento %'
UNION ALL
SELECT 'obrigacoes DAS', count(*)
FROM guia_das
WHERE numero_documento LIKE 'SCM-TESTE-GUIA-%';
