package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.lancamento.dtos.LancamentoRequest;
import ifsc.pi.scm.models.lancamento.dtos.LancamentoResponse;
import ifsc.pi.scm.services.LancamentoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/lancamentos", "/lancamentos"})
public class LancamentoController {
    private final LancamentoService service;

    public LancamentoController(LancamentoService service) { this.service = service; }

    @GetMapping
    public Page<LancamentoResponse> listar(@RequestParam(required = false) String busca,
                                            @PageableDefault(size = 100) Pageable pageable) {
        return service.listar(busca, pageable);
    }

    @PostMapping
    public ResponseEntity<LancamentoResponse> criar(@Valid @RequestBody LancamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public LancamentoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody LancamentoRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) { service.excluir(id); }
}