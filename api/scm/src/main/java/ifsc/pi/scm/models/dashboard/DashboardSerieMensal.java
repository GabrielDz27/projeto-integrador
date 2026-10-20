package ifsc.pi.scm.models.dashboard;

import java.math.BigDecimal;

public record DashboardSerieMensal(
        String competencia,
        BigDecimal faturamento,
        BigDecimal recebido,
        BigDecimal pendente,
        long guiasPagas,
        long guiasPendentes,
        long guiasVencidas
) {}