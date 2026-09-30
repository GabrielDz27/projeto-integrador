package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.fornecedor.dtos.FornecedorRequest;
import ifsc.pi.scm.models.fornecedor.dtos.FornecedorResponse;
import ifsc.pi.scm.services.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/fornecedores", "/fornecedores"})
public class FornecedorController {
    private final FornecedorService service;

    public FornecedorController(FornecedorService service) {
        this.service = service;
    }

    @GetMapping
    public Page<FornecedorResponse> listar(@RequestParam(required = false) String busca,
                                           @PageableDefault(size = 20) Pageable pageable) {
        return service.listar(busca, pageable);
    }

    @GetMapping("/{id}")
    public FornecedorResponse buscar(@PathVariable UUID id) { return service.buscarPorId(id); }

    @PostMapping
    public ResponseEntity<FornecedorResponse> criar(@Valid @RequestBody FornecedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public FornecedorResponse atualizar(@PathVariable UUID id, @Valid @RequestBody FornecedorRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) { service.excluir(id); }
}
