package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.historico.HistoricoCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface HistoricoClienteRepository extends JpaRepository<HistoricoCliente, UUID> {
	List<HistoricoCliente> findByClienteIdOrderByDataHoraDesc(UUID clienteId);
}
