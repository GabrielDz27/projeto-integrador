package ifsc.pi.scm.models.obrigacao.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GuiaDasRequest(
        @NotBlank @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])", message = "Competência deve estar no formato AAAA-MM") String competencia,
        @NotNull LocalDate vencimento,
        @NotNull @DecimalMin(value = "0.00", message = "O valor não pode ser negativo") BigDecimal valor,
        @NotBlank @Pattern(regexp = "PAGO|PENDENTE", message = "Status inválido") String status
) {}