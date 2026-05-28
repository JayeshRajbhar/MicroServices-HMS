package com.example.staff.integration;

public record PatientSummary(
        Long id,
        String name,
        String dateOfBirth,
        String medicalHistory
        ) {

}
