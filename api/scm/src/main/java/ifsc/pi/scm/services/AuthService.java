package ifsc.pi.scm.services;

import ifsc.pi.scm.configs.exceptions.ValidacaoException;
import ifsc.pi.scm.configs.security.JWTUtil;
import ifsc.pi.scm.models.auth.LoginRequest;
import ifsc.pi.scm.models.auth.PasswordRecoveryToken;
import ifsc.pi.scm.models.auth.RecuperarSenhaConfirmarRequest;
import ifsc.pi.scm.models.auth.RecuperarSenhaSolicitarRequest;
import ifsc.pi.scm.models.usuario.Usuario;
import ifsc.pi.scm.models.usuario.dtos.CreateUsuarioRequest;
import ifsc.pi.scm.repositorys.PasswordRecoveryTokenRepository;
import ifsc.pi.scm.repositorys.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordRecoveryTokenRepository passwordRecoveryTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTUtil jwtUtil;

    public Map<String, String> login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.senha())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new ValidacaoException("Usuário não encontrado."));

        return Map.of("jwt-token", jwtUtil.gerarToken(usuario));
    }

    @Transactional
    public Map<String, String> cadastrar(CreateUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.username())) {
            throw new ValidacaoException("Username já cadastrado.");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ValidacaoException("E-mail já cadastrado.");
        }

        Usuario usuario = new Usuario(request);
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuarioRepository.save(usuario);

        return login(new LoginRequest(request.username(), request.senha()));
    }

    @Transactional
    public Map<String, String> solicitarRecuperacaoSenha(RecuperarSenhaSolicitarRequest request) {
        Optional<Usuario> usuarioOpcional = usuarioRepository.findByEmail(request.email());

        if (usuarioOpcional.isEmpty()) {
            return Map.of("message", "Se o e-mail estiver cadastrado, o link de recuperação foi enviado.");
        }

        String token = UUID.randomUUID().toString();
        PasswordRecoveryToken tokenAtual = passwordRecoveryTokenRepository.findByEmailAndUsedFalse(request.email())
                .orElse(null);

        if (tokenAtual != null) {
            tokenAtual.setUsed(true);
            passwordRecoveryTokenRepository.save(tokenAtual);
        }

        PasswordRecoveryToken passwordRecoveryToken = PasswordRecoveryToken.builder()
                .token(token)
                .email(request.email())
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();
        passwordRecoveryTokenRepository.save(passwordRecoveryToken);

        return Map.of(
                "message", "Se o e-mail estiver cadastrado, o link de recuperação foi enviado.",
                "token", token,
                "email", request.email()
        );
    }

    @Transactional
    public Map<String, String> confirmarRecuperacaoSenha(RecuperarSenhaConfirmarRequest request) {
        PasswordRecoveryToken token = passwordRecoveryTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ValidacaoException("Token inválido ou expirado."));

        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidacaoException("Token inválido ou expirado.");
        }

        Usuario usuario = usuarioRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new ValidacaoException("Usuário não encontrado para este token."));

        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);

        token.setUsed(true);
        passwordRecoveryTokenRepository.save(token);

        return Map.of("message", "Senha redefinida com sucesso.");
    }
}
