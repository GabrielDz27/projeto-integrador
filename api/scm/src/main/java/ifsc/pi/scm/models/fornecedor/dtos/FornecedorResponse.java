package ifsc.pi.scm.models.fornecedor.dtos;

import ifsc.pi.scm.models.fornecedor.Fornecedor;
import java.time.LocalDateTime;
import java.util.UUID;

public record FornecedorResponse(UUID id, String razaoSocial, String nomeFantasia, String cnpj, String email,
                                 String telefone, String endereco, String cidade, String estado, String cep,
                                 Boolean ativo, LocalDateTime dataCadastro) {
    public FornecedorResponse(Fornecedor fornecedor) {
        this(fornecedor.getId(), fornecedor.getRazaoSocial(), fornecedor.getNomeFantasia(), fornecedor.getCnpj(),
                fornecedor.getEmail(), fornecedor.getTelefone(), fornecedor.getEndereco(), fornecedor.getCidade(),
                fornecedor.getEstado(), fornecedor.getCep(), fornecedor.getAtivo(), fornecedor.getDataCadastro());
    }
}
