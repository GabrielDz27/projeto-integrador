package ifsc.pi.scm.services;

import ifsc.pi.scm.models.fornecedor.Fornecedor;
import ifsc.pi.scm.models.fornecedor.dtos.FornecedorRequest;
import ifsc.pi.scm.models.fornecedor.dtos.FornecedorResponse;
import ifsc.pi.scm.repositorys.FornecedorRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class FornecedorService {
    private final FornecedorRepository repository;

    public FornecedorService(FornecedorRepository repository) {
        this.repository = repository;
    }

    public Page<FornecedorResponse> listar(String busca, Pageable pageable) {
        Page<Fornecedor> fornecedores = busca == null || busca.isBlank()
                ? repository.findAll(pageable)
                : repository.findByRazaoSocialContainingIgnoreCaseOrNomeFantasiaContainingIgnoreCaseOrCnpjContaining(busca, busca, busca, pageable);
        return fornecedores.map(FornecedorResponse::new);
    }

    public FornecedorResponse buscarPorId(UUID id) {
        return repository.findById(id).map(FornecedorResponse::new)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado."));
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest request) {
        return new FornecedorResponse(repository.save(preencher(new Fornecedor(), request)));
    }

    @Transactional
    public FornecedorResponse atualizar(UUID id, FornecedorRequest request) {
        Fornecedor fornecedor = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado."));
        return new FornecedorResponse(repository.save(preencher(fornecedor, request)));
    }

    @Transactional
    public void excluir(UUID id) {
        Fornecedor fornecedor = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado."));
        fornecedor.setAtivo(false);
        repository.save(fornecedor);
    }

    private Fornecedor preencher(Fornecedor fornecedor, FornecedorRequest request) {
        fornecedor.setRazaoSocial(request.razaoSocial());
        fornecedor.setNomeFantasia(request.nomeFantasia());
        fornecedor.setCnpj(request.cnpj());
        fornecedor.setEmail(request.email());
        fornecedor.setTelefone(request.telefone());
        fornecedor.setEndereco(request.endereco());
        fornecedor.setCidade(request.cidade());
        fornecedor.setEstado(request.estado() == null ? null : request.estado().toUpperCase());
        fornecedor.setCep(request.cep());
        if (request.ativo() != null) fornecedor.setAtivo(request.ativo());
        return fornecedor;
    }
}
