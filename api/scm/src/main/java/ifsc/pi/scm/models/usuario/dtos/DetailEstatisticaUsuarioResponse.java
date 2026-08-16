package ifsc.pi.scm.models.usuario.dtos;

public record DetailEstatisticaUsuarioResponse(
       int partidasJogadas,
       int partidasCriadas,
       double avaliacaoMedia,
       double taxaPresenca,
       String comparacaoPartidasJogadasPorMes,
       String comparacaoPartidasCriadasPorMes
) {}
