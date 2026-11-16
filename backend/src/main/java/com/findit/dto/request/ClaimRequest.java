package com.findit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body of POST /api/claims/{itemId}. */
public record ClaimRequest(
        @NotBlank(message = "Please explain why this item is yours") @Size(max = 2000, message = "Description must be at most 2000 characters") String description,

        @NotBlank(message = "Proof or identifying details are required") @Size(max = 2000, message = "Proof details must be at most 2000 characters") String proofDetails) {
}


