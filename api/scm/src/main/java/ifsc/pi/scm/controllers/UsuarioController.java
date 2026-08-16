package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.usuario.dtos.DetailUsuarioResponse;
import ifsc.pi.scm.models.usuario.dtos.UpdateUsuarioRequest;
import ifsc.pi.scm.services.UsuarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * @Endpoints
     * @Usuario
     *
     * Endpoint: GET /me (usuário logado)
     *
     * Endpoint: PUT /me (editar perfil: nome, bio, cep/cidade/estado, telefone)
     *
     * Endpoint: DELETE /me
     *
     * Endpoint: GET /me/estatisticas
     *
     * Endpoint: GET avatar/{id}
     */

    @GetMapping("/me")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<DetailUsuarioResponse> getUsuarioDetails() {
        return ResponseEntity.ok(usuarioService.getDadosUsuario());
    }

    @PutMapping("/me")
    public ResponseEntity updateUsuario(@RequestBody @Valid UpdateUsuarioRequest updateUsuarioRequest) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(updateUsuarioRequest));
    }

    @DeleteMapping("/me")
    public ResponseEntity deleteUsuario() {
        usuarioService.excluirUsuario();
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/avatar/{id}")
    public ResponseEntity<String> avatarUsuario(@PathVariable Long id) {
        var avatar = usuarioService.buscarAvatarUsuario(id);
        return ResponseEntity.ok(avatar);
    }
}