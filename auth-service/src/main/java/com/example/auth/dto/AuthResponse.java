package com.example.auth.dto;

public record AuthResponse(
        String token,
        String fullName,
        String email,
        String role
        ) {

}
