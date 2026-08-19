package ifsc.pi.scm.models.usuario.dtos;

import jakarta.validation.constraints.*;

public record CreateUsuarioRequest(

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

        @NotNull(message = "Estado é obrigatório")
        String estado,

        @NotBlank(message = "A cidade é obrigatório")
        String cidade,

        @NotBlank(message = "O username é obrigatório")
        @Size(max = 60)
        String username,

        @NotBlank(message = "A senha é obrigatória")
        @Pattern.List({
                @Pattern(regexp = ".*\\d.*", message = "A senha deve conter pelo menos um dígito (0-9)."),
                @Pattern(regexp = ".*[a-z].*", message = "A senha deve conter pelo menos uma letra minúscula (a-z)."),
                @Pattern(regexp = ".*[A-Z].*", message = "A senha deve conter pelo menos uma letra maiúscula (A-Z)."),
                @Pattern(regexp = ".*[\\$*&@#].*", message = "A senha deve conter pelo menos um caractere especial: $, *, &, @ ou #."),
                @Pattern(regexp = "^[0-9a-zA-Z\\$*&@#]+$", message = "A senha contém caracteres não permitidos. Use apenas letras, números e $, *, &, @ ou #.")
        })
        String senha,

        String avatarUrl
) {}
