package ifsc.pi.scm.services;

import ifsc.pi.scm.models.cliente.Cliente;
import ifsc.pi.scm.models.lancamento.Lancamento;
import ifsc.pi.scm.models.lancamento.dtos.LancamentoRequest;
import ifsc.pi.scm.models.lancamento.dtos.LancamentoResponse;
import ifsc.pi.scm.repositorys.ClienteRepository;
import ifsc.pi.scm.repositorys.LancamentoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class LancamentoService {
    private final LancamentoRepository repository;
    private final ClienteRepository clienteRepository;

    public LancamentoService(LancamentoRepository repository, ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    public Page<LancamentoResponse> listar(String busca, Pageable pageable) {
        Page<Lancamento> page = busca == null || busca.isBlank()
                ? repository.findAll(pageable)
                : repository.findByDescricaoContainingIgnoreCase(busca, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public LancamentoResponse criar(LancamentoRequest request) {
        return toResponse(repository.save(preencher(new Lancamento(), request)));
    }

    @Transactional
    public LancamentoResponse atualizar(UUID id, LancamentoRequest request) {
        Lancamento lancamento = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado."));
        return toResponse(repository.save(preencher(lancamento, request)));
    }

    @Transactional
    public void excluir(UUID id) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Lançamento não encontrado.");
        repository.deleteById(id);
    }

    private Lancamento preencher(Lancamento lancamento, LancamentoRequest request) {
        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));
        lancamento.setDescricao(request.descricao().trim());
        lancamento.setCliente(cliente);
        lancamento.setValor(request.valor());
        lancamento.setDataCompetencia(request.dataCompetencia());
        lancamento.setStatusRecebimento(request.statusRecebimento());
        lancamento.setNotaFiscalEmitida(request.notaFiscalEmitida());
        return lancamento;
    }

    private LancamentoResponse toResponse(Lancamento lancamento) {
        return new LancamentoResponse(lancamento.getId(), lancamento.getDescricao(), lancamento.getCliente().getId(),
                lancamento.getValor(), lancamento.getDataCompetencia(), lancamento.getStatusRecebimento(),
                lancamento.isNotaFiscalEmitida());
    }
}