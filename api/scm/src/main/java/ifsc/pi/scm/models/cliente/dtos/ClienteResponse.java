package ifsc.pi.scm.models.cliente.dtos;

import ifsc.pi.scm.models.cliente.Cliente;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String nome,
        String cpf,
        String email,
        String telefone,
        LocalDate dataNascimento,
        String endereco,
        String cidade,
        String estado,
        String cep,
        LocalDateTime dataCadastro
) {
    public ClienteResponse(Cliente cliente) {
        this(
                cliente.getId(),
                cliente.getNome(),
                cliente.getCpf(),
                cliente.getEmail(),
                cliente.getTelefone(),
                cliente.getDataNascimento(),
                cliente.getEndereco(),
                cliente.getCidade(),
                cliente.getEstado(),
                cliente.getCep(),
                cliente.getDataCadastro()
        );
    }
}
