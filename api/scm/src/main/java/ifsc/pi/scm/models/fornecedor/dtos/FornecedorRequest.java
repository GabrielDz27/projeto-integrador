package ifsc.pi.scm.models.fornecedor.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FornecedorRequest(
        @NotBlank(message = "A razão social é obrigatória") @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres") String razaoSocial,
        @Size(max = 150, message = "O nome fantasia deve ter no máximo 150 caracteres") String nomeFantasia,
        @NotBlank(message = "O CNPJ é obrigatório") @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter 14 dígitos") String cnpj,
        @Email(message = "E-mail inválido") @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres") String email,
        @Pattern(regexp = "^$|^\\d{10,11}$", message = "Telefone inválido") @Size(max = 20) String telefone,
        @Size(max = 200, message = "O endereço deve ter no máximo 200 caracteres") String endereco,
        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres") String cidade,
        @Pattern(regexp = "^[A-Za-z]{2}$", message = "Estado inválido") String estado,
        @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos") String cep,
        Boolean ativo
) {}
