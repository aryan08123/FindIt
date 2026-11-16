package com.findit.dto.response;

import com.findit.entity.User;

import java.time.LocalDateTime;

/** Safe view of a user. The password hash is never included. */
public record UserResponse(
        Long id,
        String fullName,
        String email,
        String studentId,
        String department,
        String role,
        LocalDateTime createdAt) {

    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getStudentId(),
                u.getDepartment(), u.getRole().name(), u.getCreatedAt());
    }
}
