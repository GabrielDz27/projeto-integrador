package ifsc.pi.scm.models.auth;

import jakarta.validation.constraints.NotBlank;

public record RecuperarSenhaConfirmarRequest(
        @NotBlank(message = "O token é obrigatório")
        String token,

        @NotBlank(message = "A nova senha é obrigatória")
        String novaSenha
) {}
