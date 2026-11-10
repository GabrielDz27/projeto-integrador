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
            where (cast(:busca as string) is null or lower(f.razaoSocial) like lower(concat('%', cast(:busca as string), '%'))
            or lower(coalesce(f.nomeFantasia, '')) like lower(concat('%', cast(:busca as string), '%'))
            or coalesce(f.cnpj, '') like concat('%', cast(:busca as string), '%'))
              and (:ativo is null or f.ativo = :ativo)
              and (cast(:cidade as string) is null or lower(coalesce(f.cidade, '')) like lower(concat('%', cast(:cidade as string), '%')))
              and (cast(:estado as string) is null or upper(coalesce(f.estado, '')) = upper(cast(:estado as string)))
            """)
        Page<Fornecedor> buscar(@Param("busca") String busca, @Param("ativo") Boolean ativo,
                    @Param("cidade") String cidade, @Param("estado") String estado, Pageable pageable);
}
