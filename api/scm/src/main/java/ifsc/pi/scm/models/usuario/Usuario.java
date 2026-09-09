package ifsc.pi.scm.models.usuario;

import ifsc.pi.scm.models.usuario.dtos.CreateUsuarioRequest;
import ifsc.pi.scm.models.usuario.dtos.UpdateUsuarioRequest;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(length = 11)
    private String cpf;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 250, unique = true)
    private String email;

    @Column(length = 11)
    private String telefone;

    @Column(length = 8)
    private String cep;

    @Column(length = 2)
    private String estado;

    @Column(length = 150)
    private String cidade;

    @Column(nullable = false, length = 50, unique = true)
    private String username;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    public Usuario(CreateUsuarioRequest dados) {
        this.ativo = true;
        this.cpf = dados.cpf();
        this.username = dados.username();
        this.senha = dados.senha();
        this.email = dados.email();
        this.telefone = dados.telefone();
        this.cep = dados.cep();
        this.estado = dados.estado();
        this.cidade = dados.cidade();
        this.nome = dados.nome();

        if (dados.avatarUrl() != null) {
            this.avatarUrl = dados.avatarUrl();
        }
    }

    public void atualizarInformacoes(UpdateUsuarioRequest dados) {
        if (dados.username() != null) this.username = dados.username();
        if (dados.senha() != null && !dados.senha().isBlank()) this.senha = dados.senha();
        if (dados.email() != null) this.email = dados.email();
        if (dados.telefone() != null) this.telefone = dados.telefone();
        if (dados.cep() != null) this.cep = dados.cep();
        if (dados.estado() != null) this.estado = dados.estado();
        if (dados.cidade() != null) this.cidade = dados.cidade();
        if (dados.nome() != null) this.nome = dados.nome();
        if (dados.cpf() != null) this.cpf = dados.cpf();

        if (dados.avatarUrl() != null) {
            this.avatarUrl = dados.avatarUrl();
        }
    }

    public void excluir() {
        this.ativo = false;
    }
}
