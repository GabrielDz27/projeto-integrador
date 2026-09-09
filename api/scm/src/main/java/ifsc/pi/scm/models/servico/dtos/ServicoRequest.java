package ifsc.pi.scm.models.servico.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ServicoRequest(
        @NotBlank(message = "O nome do serviço é obrigatório")
        String nome,

        String descricao,

        @NotNull(message = "O preço base é obrigatório")
        @DecimalMin(value = "0.00", inclusive = true, message = "O preço base não pode ser negativo")
        BigDecimal precoBase,

        BigDecimal aliquotaIss,

        Boolean ativo
) {}
