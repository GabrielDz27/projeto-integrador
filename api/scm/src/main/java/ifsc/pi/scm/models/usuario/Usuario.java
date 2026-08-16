package ifsc.pi.scm.models.usuario;

import ifsc.pi.scm.models.usuario.dtos.CreateUsuarioRequest;
import ifsc.pi.scm.models.usuario.dtos.UpdateUsuarioRequest;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;

    private String telefone;

    private String cep;

    private String estado;

    private String cidade;

    private String username;

    private String biografia;

    private String senha;

    private Boolean ativo;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    public Usuario (CreateUsuarioRequest dados) {
        this.ativo = true;

        this.username = dados.username();
        this.senha = dados.senha();
        this.email = dados.email();
        this.telefone = dados.telefone();
        this.cep = dados.cep();
        this.estado = dados.estado();
        this.cidade = dados.cidade();
        this.nome  = dados.nome();

        if (dados.biografia() != null)
            this.biografia = dados.biografia();

        if (dados.avatarUrl() != null)
            this.avatarUrl = dados.avatarUrl();
    }

    public void atualizarInformacoes(UpdateUsuarioRequest dados) {
        this.username = dados.username();
        if (dados.senha() != null)
            this.senha = dados.senha();
        this.email = dados.email();
        this.telefone = dados.telefone();
        this.cep = dados.cep();
        this.estado = dados.estado();
        this.cidade = dados.cidade();
        this.nome  = dados.nome();

        if (dados.biografia() != null)
            this.biografia = dados.biografia();

        if (dados.avatarUrl() != null)
            this.avatarUrl = dados.avatarUrl();
    }

    public void excluir() {
        this.ativo = false;
    }
}
