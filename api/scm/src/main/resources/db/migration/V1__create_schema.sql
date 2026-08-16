-- USUARIO
CREATE TABLE IF NOT EXISTS usuario (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(150) NOT NULL,
  email           VARCHAR(250) NOT NULL UNIQUE,
  telefone        VARCHAR(11),
  cep             VARCHAR(8),
  estado          VARCHAR(2),
  cidade          VARCHAR(150),
  username        VARCHAR(50) NOT NULL UNIQUE,
  biografia       TEXT,
  senha           TEXT NOT NULL,
  ativo 	  BOOLEAN
);
