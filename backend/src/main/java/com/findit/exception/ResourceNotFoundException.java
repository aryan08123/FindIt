package com.findit.exception;

/** Thrown when a user, item or claim does not exist (HTTP 404). */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
