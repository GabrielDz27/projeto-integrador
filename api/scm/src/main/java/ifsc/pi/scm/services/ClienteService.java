package ifsc.pi.scm.services;

import ifsc.pi.scm.configs.exceptions.ValidacaoException;
import ifsc.pi.scm.models.cliente.Cliente;
import ifsc.pi.scm.models.cliente.dtos.ClienteRequest;
import ifsc.pi.scm.models.cliente.dtos.ClienteResponse;
import ifsc.pi.scm.models.historico.HistoricoCliente;
import ifsc.pi.scm.models.historico.dtos.HistoricoClienteResponse;
import ifsc.pi.scm.repositorys.ClienteRepository;
import ifsc.pi.scm.repositorys.HistoricoClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private HistoricoClienteRepository historicoClienteRepository;

    public Page<ClienteResponse> listar(Pageable pageable) {
        return clienteRepository.findAll(pageable).map(ClienteResponse::new);
    }

    public Page<ClienteResponse> listar(String busca, Boolean ativo, String cidade, String estado, Pageable pageable) {
        String termo = normalize(busca);
        return clienteRepository.buscar(termo, ativo, normalize(cidade), normalize(estado), pageable)
                .map(ClienteResponse::new);
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    public ClienteResponse buscarPorId(UUID id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));
        return new ClienteResponse(cliente);
    }

    public List<HistoricoClienteResponse> historico(UUID id) {
        if (!clienteRepository.existsById(id)) {
            throw new EntityNotFoundException("Cliente não encontrado.");
        }
        return historicoClienteRepository.findByClienteIdOrderByDataHoraDesc(id).stream()
                .map(HistoricoClienteResponse::new)
                .toList();
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
        registrarHistorico(salvo, "INCLUSAO", "cliente", null, salvo.getNome(), "Cadastro inicial do cliente.");
        return new ClienteResponse(salvo);
    }

    @Transactional
    public ClienteResponse atualizar(UUID id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        Map<String, String> valoresAnteriores = snapshot(cliente);
        cliente.setNome(request.nome());
        cliente.setCpf(request.cpf());
        cliente.setEmail(request.email());
        cliente.setTelefone(request.telefone());
        cliente.setDataNascimento(request.dataNascimento());
        cliente.setEndereco(request.endereco());
        cliente.setCidade(request.cidade());
        cliente.setEstado(request.estado());
        cliente.setCep(request.cep());
        if (request.ativo() != null) cliente.setAtivo(request.ativo());

        Cliente salvo = clienteRepository.save(cliente);
        Map<String, String> valoresAtuais = snapshot(salvo);
        valoresAnteriores.forEach((campo, valorAnterior) -> {
            String valorNovo = valoresAtuais.get(campo);
            if (!java.util.Objects.equals(valorAnterior, valorNovo)) {
            String operacao = campo.equals("ativo")
                ? ("false".equals(valorNovo) ? "DESATIVACAO" : "REATIVACAO")
                : "ALTERACAO";
            registrarHistorico(salvo, operacao, campo, valorAnterior, valorNovo,
                campo.equals("ativo") ? "Status do cliente alterado." : "Campo do cliente atualizado.");
            }
        });
        return new ClienteResponse(salvo);
    }

    @Transactional
    public void excluir(UUID id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado."));

        if (Boolean.TRUE.equals(cliente.getAtivo())) {
            cliente.setAtivo(false);
            Cliente salvo = clienteRepository.save(cliente);
            registrarHistorico(salvo, "DESATIVACAO", "ativo", "true", "false", "Cliente desativado logicamente.");
        }
    }

    private Map<String, String> snapshot(Cliente cliente) {
        Map<String, String> values = new LinkedHashMap<>();
        values.put("nome", asText(cliente.getNome()));
        values.put("cpf", asText(cliente.getCpf()));
        values.put("email", asText(cliente.getEmail()));
        values.put("telefone", asText(cliente.getTelefone()));
        values.put("dataNascimento", asText(cliente.getDataNascimento()));
        values.put("endereco", asText(cliente.getEndereco()));
        values.put("cidade", asText(cliente.getCidade()));
        values.put("estado", asText(cliente.getEstado()));
        values.put("cep", asText(cliente.getCep()));
        values.put("ativo", asText(cliente.getAtivo()));
        return values;
    }

    private String asText(Object value) { return value == null ? null : value.toString(); }

    private void registrarHistorico(Cliente cliente, String tipoOperacao, String campoAlterado, String valorAnterior, String valorNovo, String observacao) {
        HistoricoCliente historico = HistoricoCliente.builder()
                .cliente(cliente)
                .tipoOperacao(tipoOperacao)
                .campoAlterado(campoAlterado)
                .valorAnterior(valorAnterior)
                .valorNovo(valorNovo)
                .usuario(usuarioAtual())
                .observacao(observacao)
                .build();

        historicoClienteRepository.save(historico);
    }

    private String usuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null || !authentication.isAuthenticated() ? "sistema" : authentication.getName();
    }
}
