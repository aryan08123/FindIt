package com.findit.dto.response;

/** Returned by login: the JWT plus the user's profile. */
public record AuthResponse(String token, String tokenType, UserResponse user) {
}
