package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.cliente.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
	long countByAtivoTrue();

	Page<Cliente> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCpfContaining(
			String nome, String email, String cpf, Pageable pageable);
}
