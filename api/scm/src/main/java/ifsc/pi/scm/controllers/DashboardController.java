package ifsc.pi.scm.controllers;

import ifsc.pi.scm.models.dashboard.DashboardResumoResponse;
import ifsc.pi.scm.services.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/dashboard", "/dashboard"})
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping("/resumo")
    public DashboardResumoResponse resumo() { return service.resumo(); }
}