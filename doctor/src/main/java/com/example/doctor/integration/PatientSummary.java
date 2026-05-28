package com.example.doctor.integration;

public record PatientSummary(
        Long id,
        String name,
        String dateOfBirth,
        String medicalHistory
        ) {

}
