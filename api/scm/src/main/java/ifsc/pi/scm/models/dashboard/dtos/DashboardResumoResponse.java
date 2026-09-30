package ifsc.pi.scm.models.dashboard.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardResumoResponse(
        BigDecimal recebidoNoMes,
        BigDecimal pendenteRecebimento,
        BigDecimal faturamentoAnual,
        BigDecimal limiteAnualMei,
        GuiaDasResumo guiaDas
) {
    public record GuiaDasResumo(
            String competencia,
            LocalDate vencimento,
            BigDecimal valor,
            String status
    ) {}
}