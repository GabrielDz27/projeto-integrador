package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.obrigacao.GuiaDas;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GuiaDasRepository extends JpaRepository<GuiaDas, UUID> {
    Page<GuiaDas> findByCompetenciaContaining(String competencia, Pageable pageable);
    Optional<GuiaDas> findFirstByStatusNotOrderByVencimentoAsc(String status);
}