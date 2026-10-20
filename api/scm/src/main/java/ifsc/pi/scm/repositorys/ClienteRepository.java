package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.cliente.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
	long countByAtivoTrue();

	    @Query("""
		    select c from Cliente c
		    where (:busca is null or lower(c.nome) like lower(concat('%', :busca, '%'))
			or lower(coalesce(c.email, '')) like lower(concat('%', :busca, '%'))
			or coalesce(c.cpf, '') like concat('%', :busca, '%'))
		      and (:ativo is null or c.ativo = :ativo)
		      and (:cidade is null or lower(coalesce(c.cidade, '')) like lower(concat('%', :cidade, '%')))
		      and (:estado is null or upper(coalesce(c.estado, '')) = upper(:estado))
		    """)
	    Page<Cliente> buscar(@Param("busca") String busca, @Param("ativo") Boolean ativo,
				 @Param("cidade") String cidade, @Param("estado") String estado, Pageable pageable);
}
