package ifsc.pi.scm.configs.exceptions;

import java.util.Map;

public record ApiErrorResponse(String code, String message, Map<String, String> fieldErrors) {
    public ApiErrorResponse {
        fieldErrors = fieldErrors == null ? Map.of() : Map.copyOf(fieldErrors);
    }

    public static ApiErrorResponse of(String code, String message) {
        return new ApiErrorResponse(code, message, Map.of());
    }
}
