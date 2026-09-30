package ifsc.pi.scm.models.lancamento.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LancamentoRequest(
        @NotBlank String descricao,
        @NotNull UUID idCliente,
        @NotNull @DecimalMin(value = "0.00", message = "O valor não pode ser negativo") BigDecimal valor,
        @NotNull LocalDate dataCompetencia,
        @NotBlank @jakarta.validation.constraints.Pattern(regexp = "PAGO|PENDENTE", message = "Status de recebimento inválido") String statusRecebimento,
        boolean notaFiscalEmitida
) {
    public LancamentoRequest {
    }
}