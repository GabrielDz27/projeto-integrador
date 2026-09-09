package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.servico.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {
}
