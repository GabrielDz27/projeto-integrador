package ifsc.pi.scm.models.lancamento;

import ifsc.pi.scm.models.cliente.Cliente;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "lancamento")
@Getter
@Setter
@NoArgsConstructor
public class Lancamento {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_lancamento")
    private UUID id;

    @Column(nullable = false, length = 200)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_competencia", nullable = false)
    private LocalDate dataCompetencia;

    @Column(name = "status_recebimento", nullable = false, length = 20)
    private String statusRecebimento;

    @Column(name = "nota_fiscal_emitida", nullable = false)
    private boolean notaFiscalEmitida;
}