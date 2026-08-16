package ifsc.pi.scm.services;

import ifsc.pi.scm.configs.exceptions.ValidacaoException;
import ifsc.pi.scm.models.usuario.Usuario;
import ifsc.pi.scm.models.usuario.dtos.DetailEstatisticaUsuarioResponse;
import ifsc.pi.scm.models.usuario.dtos.DetailUsuarioResponse;
import ifsc.pi.scm.models.usuario.dtos.UpdateUsuarioRequest;
import ifsc.pi.scm.repositorys.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder encoder;

    public Usuario getUsuarioAutenticado() {
        String userName = (String) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        Optional<Usuario> usuario = usuarioRepository.findByUsername(userName);

        if (usuario.isEmpty()) {
            throw new EntityNotFoundException("Usuario não encontrado");
        }

        return usuario.get();
    }

    public DetailUsuarioResponse getDadosUsuario() {
        return new DetailUsuarioResponse(getUsuarioAutenticado());
    }

    @Transactional
    public DetailUsuarioResponse atualizarUsuario(@Valid UpdateUsuarioRequest updateUsuarioRequest) {
        var usuario = getUsuarioAutenticado();

        usuario.atualizarInformacoes(updateUsuarioRequest);

        return new DetailUsuarioResponse(usuario);
    }

    @Transactional
    public void excluirUsuario() {
        var usuario = getUsuarioAutenticado();
        usuario.excluir();
    }

    public String buscarAvatarUsuario(Long id) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ValidacaoException("Usuário não encontrado."));

        return usuario.getAvatarUrl();
    }
}