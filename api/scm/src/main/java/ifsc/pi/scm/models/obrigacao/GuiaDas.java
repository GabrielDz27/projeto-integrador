package ifsc.pi.scm.models.obrigacao;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guia_das")
@Getter
@Setter
@NoArgsConstructor
public class GuiaDas {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_guia")
    private UUID id;

    @Column(name = "periodo_apuracao", nullable = false, length = 7)
    private String competencia;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate vencimento;

    @Column(name = "valor_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @PrePersist
    void onCreate() { if (dataCadastro == null) dataCadastro = LocalDateTime.now(); }
}