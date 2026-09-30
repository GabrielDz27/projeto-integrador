package ifsc.pi.scm.models.cliente.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ClienteRequest(
        @NotBlank(message = "O nome do cliente é obrigatório")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String nome,

        @Pattern(regexp = "\\d{11}", message = "CPF inválido")
        String cpf,

        @Email(message = "E-mail inválido")
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres")
        String email,

        @Pattern(regexp = "^\\d{10,11}$", message = "Telefone inválido")
        String telefone,

        LocalDate dataNascimento,
        @Size(max = 200, message = "O endereço deve ter no máximo 200 caracteres") String endereco,
        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres") String cidade,
        @Pattern(regexp = "^[A-Z]{2}$", message = "Estado inválido")
        String estado,
        @Pattern(regexp = "\\d{8}", message = "CEP inválido")
        String cep,
        Boolean ativo
) {}
