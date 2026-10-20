package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.dashboard.DashboardResumoResponse;
import ifsc.pi.scm.models.dashboard.DashboardSerieMensal;
import ifsc.pi.scm.services.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/dashboard", "/dashboard"})
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping("/resumo")
    public DashboardResumoResponse resumo(@RequestParam UUID clienteId) { return service.resumo(clienteId); }

    @GetMapping("/serie-mensal")
    public List<DashboardSerieMensal> serieMensal(@RequestParam UUID clienteId) {
        return service.serieMensal(clienteId);
    }
}