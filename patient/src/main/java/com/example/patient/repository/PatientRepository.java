package com.example.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.patient.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
