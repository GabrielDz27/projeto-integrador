package ifsc.pi.scm.services;

import ifsc.pi.scm.configs.exceptions.ValidacaoException;
import ifsc.pi.scm.models.cliente.Cliente;
import ifsc.pi.scm.models.cliente.dtos.ClienteRequest;
import ifsc.pi.scm.models.cliente.dtos.ClienteResponse;
import ifsc.pi.scm.models.historico.HistoricoCliente;
import ifsc.pi.scm.repositorys.ClienteRepository;
import ifsc.pi.scm.repositorys.HistoricoClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private HistoricoClienteRepository historicoClienteRepository;

    public Page<ClienteResponse> listar(Pageable pageable) {
        return clienteRepository.findAll(pageable).map(ClienteResponse::new);
    }

    public ClienteResponse buscarPorId(UUID id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));
        return new ClienteResponse(cliente);
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        Cliente cliente = Cliente.builder()
                .nome(request.nome())
                .cpf(request.cpf())
                .email(request.email())
                .telefone(request.telefone())
                .dataNascimento(request.dataNascimento())
                .endereco(request.endereco())
                .cidade(request.cidade())
                .estado(request.estado())
                .cep(request.cep())
                .build();

        Cliente salvo = clienteRepository.save(cliente);
        registrarHistorico(salvo, "INCLUSAO", null, null, "criado", "Cadastro inicial do cliente.");
        return new ClienteResponse(salvo);
    }

    @Transactional
    public ClienteResponse atualizar(UUID id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        String valorAnterior = cliente.getNome();
        cliente.setNome(request.nome());
        cliente.setCpf(request.cpf());
        cliente.setEmail(request.email());
        cliente.setTelefone(request.telefone());
        cliente.setDataNascimento(request.dataNascimento());
        cliente.setEndereco(request.endereco());
        cliente.setCidade(request.cidade());
        cliente.setEstado(request.estado());
        cliente.setCep(request.cep());

        Cliente salvo = clienteRepository.save(cliente);
        registrarHistorico(salvo, "ALTERACAO", "nome", valorAnterior, request.nome(), "Atualização do cliente.");
        return new ClienteResponse(salvo);
    }

    @Transactional
    public void excluir(UUID id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        registrarHistorico(cliente, "EXCLUSAO", null, null, "cliente", "Exclusão do cliente.");
        clienteRepository.delete(cliente);
    }

    private void registrarHistorico(Cliente cliente, String tipoOperacao, String campoAlterado, String valorAnterior, String valorNovo, String observacao) {
        HistoricoCliente historico = HistoricoCliente.builder()
                .cliente(cliente)
                .tipoOperacao(tipoOperacao)
                .campoAlterado(campoAlterado)
                .valorAnterior(valorAnterior)
                .valorNovo(valorNovo)
                .usuario("sistema")
                .observacao(observacao)
                .build();

        historicoClienteRepository.save(historico);
    }
}
