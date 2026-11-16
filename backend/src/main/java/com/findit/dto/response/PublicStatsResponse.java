package com.findit.dto.response;

/** Numbers for the landing page statistics section. */
public record PublicStatsResponse(long totalLost, long totalFound, long totalRecovered, long totalStudents) {
}

