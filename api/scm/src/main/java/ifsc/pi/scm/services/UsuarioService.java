package ifsc.pi.scm.services;

import ifsc.pi.scm.configs.exceptions.ValidacaoException;
import ifsc.pi.scm.models.usuario.Usuario;
import ifsc.pi.scm.models.usuario.dtos.CreateUsuarioRequest;
import ifsc.pi.scm.models.usuario.dtos.DetailUsuarioResponse;
import ifsc.pi.scm.models.usuario.dtos.UpdateUsuarioRequest;
import ifsc.pi.scm.repositorys.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

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

    public Page<DetailUsuarioResponse> listarUsuarios(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(DetailUsuarioResponse::new);
    }

    public DetailUsuarioResponse buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado."));
        return new DetailUsuarioResponse(usuario);
    }

    @Transactional
    public DetailUsuarioResponse criarUsuario(@Valid CreateUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.username())) {
            throw new ValidacaoException("Já existe um usuário com este username.");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ValidacaoException("Já existe um usuário com este e-mail.");
        }

        Usuario usuario = new Usuario(request);
        usuario.setSenha(encoder.encode(request.senha()));
        usuarioRepository.save(usuario);
        return new DetailUsuarioResponse(usuario);
    }

    @Transactional
    public DetailUsuarioResponse atualizarUsuario(UUID id, @Valid UpdateUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado."));

        if (request.username() != null && !request.username().equals(usuario.getUsername()) && usuarioRepository.existsByUsername(request.username())) {
            throw new ValidacaoException("Já existe um usuário com este username.");
        }
        if (request.email() != null && !request.email().equals(usuario.getEmail()) && usuarioRepository.existsByEmail(request.email())) {
            throw new ValidacaoException("Já existe um usuário com este e-mail.");
        }

        usuario.atualizarInformacoes(request);
        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenha(encoder.encode(request.senha()));
        }

        return new DetailUsuarioResponse(usuario);
    }

    @Transactional
    public void desativarUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado."));
        usuario.excluir();
    }

    @Transactional
    public DetailUsuarioResponse atualizarUsuarioLogado(@Valid UpdateUsuarioRequest updateUsuarioRequest) {
        var usuario = getUsuarioAutenticado();

        usuario.atualizarInformacoes(updateUsuarioRequest);
        if (updateUsuarioRequest.senha() != null && !updateUsuarioRequest.senha().isBlank()) {
            usuario.setSenha(encoder.encode(updateUsuarioRequest.senha()));
        }

        return new DetailUsuarioResponse(usuario);
    }

    @Transactional
    public void excluirUsuario() {
        var usuario = getUsuarioAutenticado();
        usuario.excluir();
    }

    public String buscarAvatarUsuario(Long id) {
        var usuario = usuarioRepository.findById(UUID.fromString(String.valueOf(id)))
                .orElseThrow(() -> new ValidacaoException("Usuário não encontrado."));

        return usuario.getAvatarUrl();
    }
}