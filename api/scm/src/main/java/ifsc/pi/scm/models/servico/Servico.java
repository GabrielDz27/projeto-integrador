package ifsc.pi.scm.models.servico;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "servico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Servico {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_servico")
    private UUID id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoBase;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIss;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @PrePersist
    public void onCreate() {
        if (this.dataCadastro == null) {
            this.dataCadastro = LocalDateTime.now();
        }
        if (this.ativo == null) {
            this.ativo = true;
        }
        if (this.precoBase == null) {
            this.precoBase = BigDecimal.ZERO;
        }
        if (this.aliquotaIss == null) {
            this.aliquotaIss = BigDecimal.ZERO;
        }
    }
}
