package ifsc.pi.scm.models.historico.dtos;

import ifsc.pi.scm.models.historico.HistoricoCliente;

import java.time.LocalDateTime;
import java.util.UUID;

public record HistoricoClienteResponse(
        UUID id,
        String tipoOperacao,
        String campoAlterado,
        String valorAnterior,
        String valorNovo,
        String usuario,
        LocalDateTime dataHora,
        String observacao
) {
    public HistoricoClienteResponse(HistoricoCliente historico) {
        this(historico.getId(), historico.getTipoOperacao(), historico.getCampoAlterado(),
                historico.getValorAnterior(), historico.getValorNovo(), historico.getUsuario(),
                historico.getDataHora(), historico.getObservacao());
    }
}