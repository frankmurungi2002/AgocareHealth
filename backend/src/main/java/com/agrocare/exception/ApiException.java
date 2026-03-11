package com.agrocare.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {
    
    private final String errorCode;
    private final HttpStatus status;

    public ApiException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public static ApiException notFound(String message) {
        return new ApiException(message, "NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(message, "BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(message, "FORBIDDEN", HttpStatus.FORBIDDEN);
    }

    public static ApiException conflict(String message) {
        return new ApiException(message, "CONFLICT", HttpStatus.CONFLICT);
    }

    public static ApiException internalError(String message) {
        return new ApiException(message, "INTERNAL_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
