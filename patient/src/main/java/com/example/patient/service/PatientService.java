package com.example.patient.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.patient.entity.Patient;
import com.example.patient.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public Patient savePatient(Patient patient) {
        return repository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return repository.findAll();
    }

    public Patient getPatientById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }

    public Patient updatePatient(Long id, Patient updated) {
        Patient existing = getPatientById(id);
        existing.setName(updated.getName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setMedicalHistory(updated.getMedicalHistory());
        return repository.save(existing);
    }

    public void deletePatient(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found");
        }
        repository.deleteById(id);
    }
}
