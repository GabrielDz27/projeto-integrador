package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.lancamento.Lancamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, UUID> {
    interface SerieMensalProjection {
        String getCompetencia();
        BigDecimal getFaturamento();
        BigDecimal getRecebido();
        BigDecimal getPendente();
    }

        @Query("""
                        select l from Lancamento l
                        where l.cliente.id = :clienteId
                            and (:busca is null or lower(l.descricao) like lower(concat('%', :busca, '%')))
                            and (:status is null or l.statusRecebimento = :status)
                            and (:notaFiscalEmitida is null or l.notaFiscalEmitida = :notaFiscalEmitida)
                        """)
        Page<Lancamento> buscar(@Param("clienteId") UUID clienteId, @Param("busca") String busca,
                                                        @Param("status") String status, @Param("notaFiscalEmitida") Boolean notaFiscalEmitida,
                                                        Pageable pageable);

    @Query(value = """
            select to_char(data_competencia, 'YYYY-MM') as competencia,
                   coalesce(sum(valor), 0) as faturamento,
                   coalesce(sum(case when status_recebimento = 'PAGO' then valor else 0 end), 0) as recebido,
                   coalesce(sum(case when status_recebimento = 'PENDENTE' then valor else 0 end), 0) as pendente
            from lancamento
            where id_cliente = :clienteId and data_competencia between :inicio and :fim
            group by to_char(data_competencia, 'YYYY-MM')
            order by competencia
            """, nativeQuery = true)
    List<SerieMensalProjection> serieMensal(@Param("clienteId") UUID clienteId,
                                            @Param("inicio") LocalDate inicio,
                                            @Param("fim") LocalDate fim);

    @Query("select coalesce(sum(l.valor), 0) from Lancamento l where l.cliente.id = :clienteId and l.statusRecebimento = 'PAGO' and l.dataCompetencia between :inicio and :fim")
    BigDecimal somarRecebidos(@Param("clienteId") UUID clienteId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("select coalesce(sum(l.valor), 0) from Lancamento l where l.cliente.id = :clienteId and l.statusRecebimento = 'PENDENTE'")
    BigDecimal somarPendentes(@Param("clienteId") UUID clienteId);

    @Query("select coalesce(sum(l.valor), 0) from Lancamento l where l.cliente.id = :clienteId and l.dataCompetencia between :inicio and :fim")
    BigDecimal somarFaturamento(@Param("clienteId") UUID clienteId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}