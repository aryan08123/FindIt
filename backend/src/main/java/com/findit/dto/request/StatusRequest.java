package com.findit.dto.request;

import com.findit.entity.ItemStatus;
import jakarta.validation.constraints.NotNull;

/** Body of PATCH /api/items/{id}/status. */
public record StatusRequest(@NotNull(message = "Status is required") ItemStatus status) {
}

