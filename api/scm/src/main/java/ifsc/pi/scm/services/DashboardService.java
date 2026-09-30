package ifsc.pi.scm.services;

import ifsc.pi.scm.models.dashboard.DashboardResumoResponse;
import ifsc.pi.scm.repositorys.ClienteRepository;
import ifsc.pi.scm.repositorys.FornecedorRepository;
import ifsc.pi.scm.repositorys.LancamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DashboardService {
    private static final BigDecimal LIMITE_ANUAL_MEI = new BigDecimal("81000.00");
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

    public DashboardResumoResponse resumo() {
        LocalDate hoje = LocalDate.now();
        LocalDate primeiroDiaMes = hoje.withDayOfMonth(1);
        LocalDate ultimoDiaMes = hoje.withDayOfMonth(hoje.lengthOfMonth());
        LocalDate primeiroDiaAno = hoje.withDayOfYear(1);
        LocalDate ultimoDiaAno = hoje.withMonth(12).withDayOfMonth(31);
        return new DashboardResumoResponse(
                lancamentoRepository.somarRecebidos(primeiroDiaMes, ultimoDiaMes),
                lancamentoRepository.somarPendentes(),
                lancamentoRepository.somarFaturamento(primeiroDiaAno, ultimoDiaAno),
                LIMITE_ANUAL_MEI,
                clienteRepository.countByAtivoTrue(),
                fornecedorRepository.countByAtivoTrue(),
                guiaDasService.proxima());
    }
}