package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.obrigacao.GuiaDas;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuiaDasRepository extends JpaRepository<GuiaDas, UUID> {
    interface SerieMensalProjection {
        String getCompetencia();
        long getPagas();
        long getPendentes();
        long getVencidas();
    }

    Page<GuiaDas> findByCliente_IdAndCompetenciaContaining(UUID clienteId, String competencia, Pageable pageable);
    Page<GuiaDas> findByCliente_Id(UUID clienteId, Pageable pageable);
    Page<GuiaDas> findByClienteIsNull(Pageable pageable);
    Optional<GuiaDas> findFirstByCliente_IdAndStatusNotOrderByVencimentoAsc(UUID clienteId, String status);

    @Query(value = """
            select competencia as competencia,
                   count(*) filter (where status = 'PAGO') as pagas,
                   count(*) filter (where status <> 'PAGO' and data_vencimento >= :hoje) as pendentes,
                   count(*) filter (where status <> 'PAGO' and data_vencimento < :hoje) as vencidas
            from guia_das
            where id_cliente = :clienteId and competencia between :inicio and :fim
            group by competencia
            order by competencia
            """, nativeQuery = true)
    List<SerieMensalProjection> serieMensal(@Param("clienteId") UUID clienteId,
                                            @Param("inicio") String inicio,
                                            @Param("fim") String fim,
                                            @Param("hoje") LocalDate hoje);
}