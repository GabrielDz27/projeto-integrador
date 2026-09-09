package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.auth.LoginRequest;
import ifsc.pi.scm.models.auth.RecuperarSenhaConfirmarRequest;
import ifsc.pi.scm.models.auth.RecuperarSenhaSolicitarRequest;
import ifsc.pi.scm.models.usuario.dtos.CreateUsuarioRequest;
import ifsc.pi.scm.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody @Valid CreateUsuarioRequest request) {
        return ResponseEntity.ok(authService.cadastrar(request));
    }

    @PostMapping("/recuperar-senha-solicitar")
    public ResponseEntity<Map<String, String>> recuperarSenhaSolicitar(@RequestBody @Valid RecuperarSenhaSolicitarRequest request) {
        return ResponseEntity.ok(authService.solicitarRecuperacaoSenha(request));
    }

    @PostMapping("/recuperar-senha-confirmar")
    public ResponseEntity<Map<String, String>> recuperarSenhaConfirmar(@RequestBody @Valid RecuperarSenhaConfirmarRequest request) {
        return ResponseEntity.ok(authService.confirmarRecuperacaoSenha(request));
    }
}
