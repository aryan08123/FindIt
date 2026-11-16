package com.findit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Form fields for reporting or editing an item (sent as multipart/form-data,
 * the image travels separately).
 * reportedDate = the date the item was lost or found (format yyyy-MM-dd).
 */
public record ItemRequest(
        @NotBlank(message = "Item name is required") @Size(max = 120, message = "Item name must be at most 120 characters") String itemName,

        @NotBlank(message = "Category is required") @Size(max = 50, message = "Category must be at most 50 characters") String category,

        @NotBlank(message = "Description is required") @Size(max = 2000, message = "Description must be at most 2000 characters") String description,

        @NotNull(message = "Date is required") @PastOrPresent(message = "Date cannot be in the future") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate reportedDate,

        @NotBlank(message = "Location is required") @Size(max = 150, message = "Location must be at most 150 characters") String location,

        @Size(max = 150, message = "Contact information must be at most 150 characters") String contactInfo,

        @Size(max = 2000, message = "Additional details must be at most 2000 characters") String additionalDetails) {
}




