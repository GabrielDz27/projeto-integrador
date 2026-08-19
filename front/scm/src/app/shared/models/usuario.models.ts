export interface UsuarioPerfilVM {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  username: string;
  biografia: string;
  avatarUrl?: string;
};

export type CreateUsuarioDTO = {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  username: string;
  biografia: string;
  senha: string;
  avatarUrl?: string;
};

export type UpdateUsuarioDTO = {
  nome?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  estado?: string;
  cidade?: string;
  username?: string;
  biografia?: string;
  senha?: string;
  avatarUrl?: string;
};

export type DetailUsuarioResponseDTO = {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  username: string;
  biografia: string;
  avatarUrl?: string;
};

export interface UsuarioEstatisticasDTO {
  partidasJogadas: number;
  partidasCriadas: number;
  avaliacaoMedia: number;
  taxaPresenca: number;
  comparacaoPartidasJogadasPorMes: string;
  comparacaoPartidasCriadasPorMes: string;
}