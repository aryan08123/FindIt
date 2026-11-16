package com.findit.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * One item as sent to the frontend.
 * In list views reportedById, reportedByName, contactInfo and additionalDetails
 * are null (privacy).
 * ownedByMe / claimedByMe let the UI show Edit/Delete or hide "Submit Claim".
 */
public record ItemResponse(
        Long id,
        String itemName,
        String category,
        String description,
        String itemType,
        String location,
        LocalDate reportedDate,
        String imageUrl,
        String status,
        Long reportedById,
        String reportedByName,
        String contactInfo,
        String additionalDetails,
        boolean ownedByMe,
        boolean claimedByMe,
        LocalDateTime createdAt) {
}

