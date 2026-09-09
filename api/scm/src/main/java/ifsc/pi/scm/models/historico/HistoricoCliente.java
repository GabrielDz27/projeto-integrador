package ifsc.pi.scm.models.historico;

import ifsc.pi.scm.models.cliente.Cliente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "historico_cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoCliente {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_historico")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "tipo_operacao", nullable = false, length = 20)
    private String tipoOperacao;

    @Column(name = "campo_alterado", length = 100)
    private String campoAlterado;

    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;

    @Column(name = "valor_novo", columnDefinition = "TEXT")
    private String valorNovo;

    @Column(length = 100)
    private String usuario;

    @Column(name = "data_hora")
    private LocalDateTime dataHora;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @PrePersist
    public void onCreate() {
        if (this.dataHora == null) {
            this.dataHora = LocalDateTime.now();
        }
    }
}
