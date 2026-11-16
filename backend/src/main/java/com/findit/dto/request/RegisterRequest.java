package com.findit.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Body of POST /api/auth/register. The role is NOT accepted here; everyone
 * registers as STUDENT.
 */
public record RegisterRequest(
        @NotBlank(message = "Full name is required") @Size(max = 100, message = "Full name must be at most 100 characters") String fullName,

        @NotBlank(message = "College email is required") @Email(message = "Enter a valid email address") @Size(max = 150, message = "Email must be at most 150 characters") String email,

        @NotBlank(message = "Student ID is required") @Size(max = 30, message = "Student ID must be at most 30 characters") String studentId,

        @NotBlank(message = "Department is required") @Size(max = 100, message = "Department must be at most 100 characters") String department,

        @NotBlank(message = "Password is required") @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "Password must be 8-72 characters with at least one letter and one number") String password,

        @NotBlank(message = "Please confirm your password") String confirmPassword) {
}