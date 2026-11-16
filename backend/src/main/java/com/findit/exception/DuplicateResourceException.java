package com.findit.exception;

/**
 * Thrown for duplicates such as an email already registered or a repeat claim
 * (HTTP 409).
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

