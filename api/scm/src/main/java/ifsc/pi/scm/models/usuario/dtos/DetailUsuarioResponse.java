package ifsc.pi.scm.models.usuario.dtos;

import ifsc.pi.scm.models.usuario.Usuario;

public record DetailUsuarioResponse(
        String nome,
        String email,
        String telefone,
        String cep,
        String estado,
        String cidade,
        String username,
        String biografia,
        String avatarUrl
) {
    public DetailUsuarioResponse(Usuario dados) {
        this(
                dados.getNome(),
                dados.getEmail(),
                dados.getTelefone(),
                dados.getCep(),
                dados.getEstado(),
                dados.getCidade(),
                dados.getUsername(),
                dados.getBiografia(),
                dados.getAvatarUrl()
        );
    }
}
