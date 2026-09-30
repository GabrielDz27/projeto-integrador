export type StatusRecebimento = 'PAGO' | 'PENDENTE';
export type StatusGuiaDas = 'PAGO' | 'PENDENTE' | 'VENCIDA';

export interface GuiaDasResumo {
  competencia: string;
  vencimento: string;
  valor: number;
  status: StatusGuiaDas;
}

export interface DashboardResumo {
  recebidoNoMes: number;
  pendenteRecebimento: number;
  faturamentoAnual: number;
  limiteAnualMei: number;
  guiaDas: GuiaDasResumo;
}

export interface Lancamento {
  id: string;
  descricao: string;
  idCliente: string;
  valor: number;
  dataCompetencia: string;
  statusRecebimento: StatusRecebimento;
  notaFiscalEmitida: boolean;
}