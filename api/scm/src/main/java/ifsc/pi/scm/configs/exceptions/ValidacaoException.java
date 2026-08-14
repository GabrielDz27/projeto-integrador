package ifsc.pi.scm.configs.exceptions;

import java.io.Serial;

public class ValidacaoException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 1L;

    public ValidacaoException(String message) {
        super(message);
    }
}
