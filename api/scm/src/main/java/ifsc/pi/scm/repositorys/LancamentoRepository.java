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

public interface LancamentoRepository extends JpaRepository<Lancamento, UUID> {
    Page<Lancamento> findByDescricaoContainingIgnoreCase(String descricao, Pageable pageable);

    @Query("select coalesce(sum(l.valor), 0) from Lancamento l where l.statusRecebimento = 'PAGO' and l.dataCompetencia between :inicio and :fim")
    BigDecimal somarRecebidos(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("select coalesce(sum(l.valor), 0) from Lancamento l where l.statusRecebimento = 'PENDENTE'")
    BigDecimal somarPendentes();

    @Query("select coalesce(sum(l.valor), 0) from Lancamento l where l.dataCompetencia between :inicio and :fim")
    BigDecimal somarFaturamento(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}