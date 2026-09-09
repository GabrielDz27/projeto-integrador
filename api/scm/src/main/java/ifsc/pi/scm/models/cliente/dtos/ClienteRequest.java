package ifsc.pi.scm.models.cliente.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record ClienteRequest(
        @NotBlank(message = "O nome do cliente é obrigatório")
        String nome,

        @Pattern(regexp = "\\d{11}", message = "CPF inválido")
        String cpf,

        @Email(message = "E-mail inválido")
        String email,

        @Pattern(regexp = "^\\d{10,11}$", message = "Telefone inválido")
        String telefone,

        LocalDate dataNascimento,
        String endereco,
        String cidade,
        @Pattern(regexp = "^[A-Z]{2}$", message = "Estado inválido")
        String estado,
        @Pattern(regexp = "\\d{8}", message = "CEP inválido")
        String cep
) {}
