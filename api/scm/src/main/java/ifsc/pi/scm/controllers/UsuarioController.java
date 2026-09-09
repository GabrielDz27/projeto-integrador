package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.usuario.dtos.CreateUsuarioRequest;
import ifsc.pi.scm.models.usuario.dtos.DetailUsuarioResponse;
import ifsc.pi.scm.models.usuario.dtos.UpdateUsuarioRequest;
import ifsc.pi.scm.services.UsuarioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/usuario", "/api/v1/usuarios"})
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<Page<DetailUsuarioResponse>> listarUsuarios(
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listarUsuarios(pageable));
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<DetailUsuarioResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<DetailUsuarioResponse> criarUsuario(@RequestBody @Valid CreateUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criarUsuario(request));
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<DetailUsuarioResponse> atualizarUsuario(@PathVariable UUID id,
                                                                @RequestBody @Valid UpdateUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, request));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<Void> desativarUsuario(@PathVariable UUID id) {
        usuarioService.desativarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<DetailUsuarioResponse> getUsuarioDetails() {
        return ResponseEntity.ok(usuarioService.getDadosUsuario());
    }

    @PutMapping("/me")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<DetailUsuarioResponse> updateUsuario(@RequestBody @Valid UpdateUsuarioRequest updateUsuarioRequest) {
        return ResponseEntity.ok(usuarioService.atualizarUsuarioLogado(updateUsuarioRequest));
    }

    @DeleteMapping("/me")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<Void> deleteUsuario() {
        usuarioService.excluirUsuario();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/avatar/{id}")
    public ResponseEntity<String> avatarUsuario(@PathVariable Long id) {
        var avatar = usuarioService.buscarAvatarUsuario(id);
        return ResponseEntity.ok(avatar);
    }
}