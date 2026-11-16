package com.findit.dto.response;

import java.time.LocalDateTime;

/**
 * One claim as sent to the frontend.
 * itemAdditionalDetails (the finder's private identifying details) is filled
 * ONLY for admins.
 */
public record ClaimResponse(
        Long id,
        Long itemId,
        String itemName,
        String itemType,
        String itemImageUrl,
        String itemStatus,
        String itemLocation,
        String itemReportedBy,
        String itemAdditionalDetails,
        Long claimantId,
        String claimantName,
        String claimantEmail,
        String claimantStudentId,
        String claimantDepartment,
        String description,
        String proofDetails,
        String status,
        String adminRemarks,
        LocalDateTime createdAt) {
}

