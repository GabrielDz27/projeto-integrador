package ifsc.pi.scm.models.obrigacao.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GuiaDasResponse(UUID id, String competencia, LocalDate vencimento, BigDecimal valor,
                              String status, LocalDate dataPagamento) {}