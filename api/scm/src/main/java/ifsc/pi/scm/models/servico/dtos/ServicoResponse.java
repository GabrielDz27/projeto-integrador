package ifsc.pi.scm.models.servico.dtos;

import ifsc.pi.scm.models.servico.Servico;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ServicoResponse(
        UUID id,
        String nome,
        String descricao,
        BigDecimal precoBase,
        BigDecimal aliquotaIss,
        Boolean ativo,
        LocalDateTime dataCadastro
) {
    public ServicoResponse(Servico servico) {
        this(
                servico.getId(),
                servico.getNome(),
                servico.getDescricao(),
                servico.getPrecoBase(),
                servico.getAliquotaIss(),
                servico.getAtivo(),
                servico.getDataCadastro()
        );
    }
}
