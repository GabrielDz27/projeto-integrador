package ifsc.pi.scm.services;

import ifsc.pi.scm.configs.exceptions.ValidacaoException;
import ifsc.pi.scm.models.cliente.Cliente;
import ifsc.pi.scm.models.obrigacao.GuiaDas;
import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasRequest;
import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasResponse;
import ifsc.pi.scm.repositorys.GuiaDasRepository;
import ifsc.pi.scm.repositorys.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@Service
public class GuiaDasService {
    private final GuiaDasRepository repository;
    private final ClienteRepository clienteRepository;

    public GuiaDasService(GuiaDasRepository repository, ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    public Page<GuiaDasResponse> listar(UUID clienteId, boolean semVinculo, String competencia, Pageable pageable) {
        if (semVinculo == (clienteId != null)) {
            throw new ValidacaoException("Informe um cliente ou solicite explicitamente as guias sem vínculo.");
        }
        Page<GuiaDas> guias;
        if (semVinculo) {
            guias = repository.findByClienteIsNull(pageable);
        } else {
            validarCliente(clienteId);
            guias = competencia == null || competencia.isBlank()
                    ? repository.findByCliente_Id(clienteId, pageable)
                    : repository.findByCliente_IdAndCompetenciaContaining(clienteId, competencia, pageable);
        }
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

    public GuiaDasResponse proxima(UUID clienteId) {
        validarCliente(clienteId);
        return repository.findFirstByCliente_IdAndStatusNotOrderByVencimentoAsc(clienteId, "PAGO")
                .map(this::toResponse).orElse(null);
    }

    public List<GuiaDasRepository.SerieMensalProjection> serieMensal(UUID clienteId, String inicio, String fim,
                                                                      LocalDate hoje) {
        return repository.serieMensal(clienteId, inicio, fim, hoje);
    }

    private GuiaDas preencher(GuiaDas guia, GuiaDasRequest request) {
        Cliente cliente = validarCliente(request.idCliente());
        guia.setCompetencia(request.competencia());
        guia.setVencimento(request.vencimento());
        guia.setValor(request.valor());
        guia.setStatus(request.status());
        guia.setCliente(cliente);
        guia.setDataPagamento("PAGO".equals(request.status()) ? LocalDate.now() : null);
        return guia;
    }

    private Cliente validarCliente(UUID clienteId) {
        return clienteRepository.findById(clienteId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Cliente/MEI não encontrado."));
    }

    private GuiaDasResponse toResponse(GuiaDas guia) {
        return new GuiaDasResponse(guia.getId(), guia.getCompetencia(), guia.getVencimento(),
                guia.getValor(), guia.getStatus(), guia.getDataPagamento(),
                guia.getCliente() == null ? null : guia.getCliente().getId());
    }
}