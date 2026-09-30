package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasRequest;
import ifsc.pi.scm.models.obrigacao.dtos.GuiaDasResponse;
import ifsc.pi.scm.services.GuiaDasService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/obrigacoes", "/obrigacoes"})
public class GuiaDasController {
    private final GuiaDasService service;

    public GuiaDasController(GuiaDasService service) { this.service = service; }

    @GetMapping
    public Page<GuiaDasResponse> listar(@RequestParam(required = false) String competencia,
                                         @PageableDefault(size = 100) Pageable pageable) {
        return service.listar(competencia, pageable);
    }

    @GetMapping("/proxima")
    public GuiaDasResponse proxima() { return service.proxima(); }

    @PostMapping
    public ResponseEntity<GuiaDasResponse> criar(@Valid @RequestBody GuiaDasRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public GuiaDasResponse atualizar(@PathVariable UUID id, @Valid @RequestBody GuiaDasRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) { service.excluir(id); }
}