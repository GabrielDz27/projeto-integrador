package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.servico.Servico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {
		@Query("""
						select s from Servico s
						where (:busca is null or lower(s.nome) like lower(concat('%', :busca, '%'))
								or lower(coalesce(s.descricao, '')) like lower(concat('%', :busca, '%')))
							and (:ativo is null or s.ativo = :ativo)
							and (:precoMin is null or s.precoBase >= :precoMin)
							and (:precoMax is null or s.precoBase <= :precoMax)
						""")
		Page<Servico> buscar(@Param("busca") String busca, @Param("ativo") Boolean ativo,
												 @Param("precoMin") BigDecimal precoMin, @Param("precoMax") BigDecimal precoMax,
												 Pageable pageable);
}
