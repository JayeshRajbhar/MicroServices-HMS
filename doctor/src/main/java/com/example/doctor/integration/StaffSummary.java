package com.example.doctor.integration;

public record StaffSummary(
        Long id,
        String name,
        String role,
        String department,
        String email,
        String phone
        ) {

}
