package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.fornecedor.Fornecedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {
    long countByAtivoTrue();
    Page<Fornecedor> findByRazaoSocialContainingIgnoreCaseOrNomeFantasiaContainingIgnoreCaseOrCnpjContaining(
            String razaoSocial, String nomeFantasia, String cnpj, Pageable pageable);
}
