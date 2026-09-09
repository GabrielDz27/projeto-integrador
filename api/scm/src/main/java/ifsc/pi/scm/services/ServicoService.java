package ifsc.pi.scm.services;

import ifsc.pi.scm.models.servico.Servico;
import ifsc.pi.scm.models.servico.dtos.ServicoRequest;
import ifsc.pi.scm.models.servico.dtos.ServicoResponse;
import ifsc.pi.scm.repositorys.ServicoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository servicoRepository;

    public Page<ServicoResponse> listar(Pageable pageable) {
        return servicoRepository.findAll(pageable).map(ServicoResponse::new);
    }

    public ServicoResponse buscarPorId(UUID id) {
        return servicoRepository.findById(id)
                .map(ServicoResponse::new)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado."));
    }

    @Transactional
    public ServicoResponse criar(ServicoRequest request) {
        Servico servico = Servico.builder()
                .nome(request.nome())
                .descricao(request.descricao())
                .precoBase(request.precoBase())
                .aliquotaIss(request.aliquotaIss() == null ? java.math.BigDecimal.ZERO : request.aliquotaIss())
                .ativo(request.ativo() == null ? true : request.ativo())
                .build();

        return new ServicoResponse(servicoRepository.save(servico));
    }

    @Transactional
    public ServicoResponse atualizar(UUID id, ServicoRequest request) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado."));

        servico.setNome(request.nome());
        servico.setDescricao(request.descricao());
        servico.setPrecoBase(request.precoBase());
        servico.setAliquotaIss(request.aliquotaIss() == null ? java.math.BigDecimal.ZERO : request.aliquotaIss());
        servico.setAtivo(request.ativo() == null ? servico.getAtivo() : request.ativo());

        return new ServicoResponse(servicoRepository.save(servico));
    }

    @Transactional
    public void excluir(UUID id) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado."));
        servico.setAtivo(false);
        servicoRepository.save(servico);
    }
}
