package com.findit.dto.response;

/** Statistics for the admin dashboard. */
public record DashboardResponse(
        long totalStudents,
        long totalLostItems,
        long totalFoundItems,
        long activeItems,
        long claimedItems,
        long recoveredItems,
        long totalClaims,
        long pendingClaims,
        long approvedClaims,
        long rejectedClaims) {
}

