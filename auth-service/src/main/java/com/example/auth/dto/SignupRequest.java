package com.example.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "fullName is required")
        @Size(max = 200, message = "fullName must be at most 200 characters")
        String fullName,
        @Email(message = "email must be valid")
        @NotBlank(message = "email is required")
        @Size(max = 200, message = "email must be at most 200 characters")
        String email,
        @NotBlank(message = "password is required")
        @Size(min = 6, max = 200, message = "password must be at least 6 characters")
        String password
        ) {

}
