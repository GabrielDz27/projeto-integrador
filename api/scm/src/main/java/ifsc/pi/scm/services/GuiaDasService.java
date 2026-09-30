package ifsc.pi.scm.services;

import ifsc.pi.scm.models.obrigacao.GuiaDas;
import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasRequest;
import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasResponse;
import ifsc.pi.scm.repositorys.GuiaDasRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class GuiaDasService {
    private final GuiaDasRepository repository;

    public GuiaDasService(GuiaDasRepository repository) { this.repository = repository; }

    public Page<GuiaDasResponse> listar(String competencia, Pageable pageable) {
        Page<GuiaDas> guias = competencia == null || competencia.isBlank()
                ? repository.findAll(pageable)
                : repository.findByCompetenciaContaining(competencia, pageable);
        return guias.map(this::toResponse);
    }

    @Transactional
    public GuiaDasResponse criar(GuiaDasRequest request) {
        return toResponse(repository.save(preencher(new GuiaDas(), request)));
    }

    @Transactional
    public GuiaDasResponse atualizar(UUID id, GuiaDasRequest request) {
        GuiaDas guia = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obrigação não encontrada."));
        return toResponse(repository.save(preencher(guia, request)));
    }

    @Transactional
    public void excluir(UUID id) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Obrigação não encontrada.");
        repository.deleteById(id);
    }

    public GuiaDasResponse proxima() {
        return repository.findFirstByStatusNotOrderByVencimentoAsc("PAGO").map(this::toResponse).orElse(null);
    }

    private GuiaDas preencher(GuiaDas guia, GuiaDasRequest request) {
        guia.setCompetencia(request.competencia());
        guia.setVencimento(request.vencimento());
        guia.setValor(request.valor());
        guia.setStatus(request.status());
        guia.setDataPagamento("PAGO".equals(request.status()) ? LocalDate.now() : null);
        return guia;
    }

    private GuiaDasResponse toResponse(GuiaDas guia) {
        return new GuiaDasResponse(guia.getId(), guia.getCompetencia(), guia.getVencimento(),
                guia.getValor(), guia.getStatus(), guia.getDataPagamento());
    }
}