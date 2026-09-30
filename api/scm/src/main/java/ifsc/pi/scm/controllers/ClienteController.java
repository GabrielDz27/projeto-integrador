package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.cliente.dtos.ClienteRequest;
import ifsc.pi.scm.models.cliente.dtos.ClienteResponse;
import ifsc.pi.scm.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/clientes", "/clientes"})
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public ResponseEntity<Page<ClienteResponse>> listar(@RequestParam(required = false) String busca,
                                                        @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return ResponseEntity.ok(clienteService.listar(busca, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<?> historico(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.historico(id));
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@RequestBody @Valid ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> atualizar(@PathVariable UUID id, @RequestBody @Valid ClienteRequest request) {
        return ResponseEntity.ok(clienteService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        clienteService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
