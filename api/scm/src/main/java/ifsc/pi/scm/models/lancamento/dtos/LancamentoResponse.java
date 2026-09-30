package ifsc.pi.scm.models.lancamento.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LancamentoResponse(
        UUID id,
        String descricao,
        UUID idCliente,
        BigDecimal valor,
        LocalDate dataCompetencia,
        String statusRecebimento,
        boolean notaFiscalEmitida
) {}