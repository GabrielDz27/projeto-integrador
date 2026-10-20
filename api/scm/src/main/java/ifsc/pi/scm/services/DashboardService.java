package ifsc.pi.scm.services;

import ifsc.pi.scm.models.dashboard.DashboardResumoResponse;
import ifsc.pi.scm.models.dashboard.DashboardSerieMensal;
import jakarta.persistence.EntityNotFoundException;
import ifsc.pi.scm.repositorys.ClienteRepository;
import ifsc.pi.scm.repositorys.FornecedorRepository;
import ifsc.pi.scm.repositorys.LancamentoRepository;
import ifsc.pi.scm.repositorys.GuiaDasRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.time.YearMonth;
import java.util.List;

@Service
public class DashboardService {
    @Value("${mei.limite-anual:81000.00}")
    private BigDecimal limiteAnualMei;
    private final LancamentoRepository lancamentoRepository;
    private final GuiaDasService guiaDasService;
    private final ClienteRepository clienteRepository;
    private final FornecedorRepository fornecedorRepository;

    public DashboardService(LancamentoRepository lancamentoRepository, GuiaDasService guiaDasService,
                            ClienteRepository clienteRepository, FornecedorRepository fornecedorRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.guiaDasService = guiaDasService;
        this.clienteRepository = clienteRepository;
        this.fornecedorRepository = fornecedorRepository;
    }

    public DashboardResumoResponse resumo(UUID clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new EntityNotFoundException("Cliente/MEI não encontrado.");
        }
        LocalDate hoje = LocalDate.now();
        LocalDate primeiroDiaMes = hoje.withDayOfMonth(1);
        LocalDate ultimoDiaMes = hoje.withDayOfMonth(hoje.lengthOfMonth());
        LocalDate primeiroDiaAno = hoje.withDayOfYear(1);
        LocalDate ultimoDiaAno = hoje.withMonth(12).withDayOfMonth(31);
        return new DashboardResumoResponse(
                lancamentoRepository.somarRecebidos(clienteId, primeiroDiaMes, ultimoDiaMes),
                lancamentoRepository.somarPendentes(clienteId),
                lancamentoRepository.somarFaturamento(clienteId, primeiroDiaAno, ultimoDiaAno),
                limiteAnualMei,
                clienteRepository.countByAtivoTrue(),
                fornecedorRepository.countByAtivoTrue(),
                guiaDasService.proxima(clienteId));
    }

    public List<DashboardSerieMensal> serieMensal(UUID clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new EntityNotFoundException("Cliente/MEI não encontrado.");
        }
        LocalDate hoje = LocalDate.now();
        YearMonth mesAtual = YearMonth.from(hoje);
        YearMonth inicio = mesAtual.minusMonths(11);
        LocalDate dataInicio = inicio.atDay(1);
        LocalDate dataFim = mesAtual.atEndOfMonth();
        Map<String, LancamentoRepository.SerieMensalProjection> lancamentos = lancamentoRepository
                .serieMensal(clienteId, dataInicio, dataFim).stream()
                .collect(Collectors.toMap(LancamentoRepository.SerieMensalProjection::getCompetencia, Function.identity()));
        Map<String, GuiaDasRepository.SerieMensalProjection> guias = guiaDasService.serieMensal(
                        clienteId, inicio.toString(), mesAtual.toString(), hoje).stream()
                .collect(Collectors.toMap(GuiaDasRepository.SerieMensalProjection::getCompetencia, Function.identity()));

        List<DashboardSerieMensal> serie = new ArrayList<>(12);
        for (int indice = 0; indice < 12; indice++) {
            String competencia = inicio.plusMonths(indice).toString();
            LancamentoRepository.SerieMensalProjection lancamento = lancamentos.get(competencia);
            GuiaDasRepository.SerieMensalProjection guia = guias.get(competencia);
            serie.add(new DashboardSerieMensal(competencia,
                    lancamento == null ? BigDecimal.ZERO : lancamento.getFaturamento(),
                    lancamento == null ? BigDecimal.ZERO : lancamento.getRecebido(),
                    lancamento == null ? BigDecimal.ZERO : lancamento.getPendente(),
                    guia == null ? 0 : guia.getPagas(),
                    guia == null ? 0 : guia.getPendentes(),
                    guia == null ? 0 : guia.getVencidas()));
        }
        return serie;
    }
}