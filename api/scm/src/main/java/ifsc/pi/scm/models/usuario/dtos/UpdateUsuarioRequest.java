package ifsc.pi.scm.models.usuario.dtos;

import jakarta.validation.constraints.*;

public record UpdateUsuarioRequest(
        @Pattern(regexp = "\\d{11}", message = "CPF inválido")
        String cpf,

        @NotBlank(message = "O nome é obrigatório")
        @Size(min = 1, max = 150)
        String nome,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        @Size(max = 250)
        String email,

        @Pattern(
                regexp = "^\\d{10,11}$",
                message = "Telefone inválido"
        )
        String telefone,

        @Pattern(
                regexp = "\\d{8}",
                message = "CEP inválido"
        )
        String cep,

        @NotBlank(message = "Estado é obrigatório")
        @Pattern(regexp = "^[A-Za-z]{2}$", message = "Estado deve conter 2 letras")
        String estado,

        @NotBlank(message = "A cidade é obrigatória")
        String cidade,

        @NotBlank(message = "O username é obrigatório")
        @Size(max = 50, message = "O username deve ter no máximo 50 caracteres")
        String username,

        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
        String senha,
        String avatarUrl
) {
}
