package ifsc.pi.scm.repositorys;

import ifsc.pi.scm.models.auth.PasswordRecoveryToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordRecoveryTokenRepository extends JpaRepository<PasswordRecoveryToken, UUID> {
    Optional<PasswordRecoveryToken> findByToken(String token);
    Optional<PasswordRecoveryToken> findByEmailAndUsedFalse(String email);
}
