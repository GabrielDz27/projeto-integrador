package ifsc.pi.scm.models.usuario.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginUsuarioResponse(
        @NotBlank
        @Size(max = 50)
        String username,
        @NotBlank
        String senha
) {
}
