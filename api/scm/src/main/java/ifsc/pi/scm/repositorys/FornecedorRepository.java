package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.fornecedor.Fornecedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {
    long countByAtivoTrue();
        @Query("""
            select f from Fornecedor f
            where (:busca is null or lower(f.razaoSocial) like lower(concat('%', :busca, '%'))
            or lower(coalesce(f.nomeFantasia, '')) like lower(concat('%', :busca, '%'))
            or coalesce(f.cnpj, '') like concat('%', :busca, '%'))
              and (:ativo is null or f.ativo = :ativo)
              and (:cidade is null or lower(coalesce(f.cidade, '')) like lower(concat('%', :cidade, '%')))
              and (:estado is null or upper(coalesce(f.estado, '')) = upper(:estado))
            """)
        Page<Fornecedor> buscar(@Param("busca") String busca, @Param("ativo") Boolean ativo,
                    @Param("cidade") String cidade, @Param("estado") String estado, Pageable pageable);
}
