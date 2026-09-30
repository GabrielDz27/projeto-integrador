package ifsc.pi.scm.models.fornecedor;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fornecedor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fornecedor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_fornecedor")
    private UUID id;

    @Column(name = "razao_social", nullable = false, length = 150)
    private String razaoSocial;
    @Column(name = "nome_fantasia", length = 150)
    private String nomeFantasia;
    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;
    @Column(length = 150)
    private String email;
    @Column(length = 20)
    private String telefone;
    @Column(length = 200)
    private String endereco;
    @Column(length = 100)
    private String cidade;
    @Column(length = 2)
    private String estado;
    @Column(length = 9)
    private String cep;
    @Column(nullable = false)
    private Boolean ativo;
    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @PrePersist
    void onCreate() {
        if (ativo == null) ativo = true;
        if (dataCadastro == null) dataCadastro = LocalDateTime.now();
    }
}
