package ifsc.pi.scm.models.dashboard;

import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasResponse;

import java.math.BigDecimal;

public record DashboardResumoResponse(BigDecimal recebidoNoMes, BigDecimal pendenteRecebimento,
                                      BigDecimal faturamentoAnual, BigDecimal limiteAnualMei,
                                      long totalClientes, long totalFornecedores, GuiaDasResponse guiaDas) {}