package com.findit.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Optional body of PATCH /api/claims/{id}/approve and /reject. Remarks are
 * required when rejecting.
 */
public record ReviewRequest(
        @Size(max = 500, message = "Remarks must be at most 500 characters") String remarks) {
}

