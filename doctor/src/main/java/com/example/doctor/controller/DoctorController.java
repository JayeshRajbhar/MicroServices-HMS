package com.example.doctor.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctor.entity.Doctor;
import com.example.doctor.integration.DoctorIntegrationService;
import com.example.doctor.integration.PatientSummary;
import com.example.doctor.integration.StaffSummary;
import com.example.doctor.service.DoctorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/doctors")
@CrossOrigin("*")
public class DoctorController {

    private final DoctorService service;
    private final DoctorIntegrationService integrationService;

    public DoctorController(DoctorService service, DoctorIntegrationService integrationService) {
        this.service = service;
        this.integrationService = integrationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Doctor addDoctor(@Valid @RequestBody Doctor doctor) {
        return service.saveDoctor(doctor);
    }

    @GetMapping
    public List<Doctor> getDoctors() {
        return service.getAllDoctors();
    }

    @GetMapping("/{id}")
    public Doctor getDoctor(@PathVariable Long id) {
        return service.getDoctorById(id);
    }

    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable Long id, @Valid @RequestBody Doctor doctor) {
        return service.updateDoctor(id, doctor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDoctor(@PathVariable Long id) {
        service.deleteDoctor(id);
    }

    @GetMapping("/patients")
    public List<PatientSummary> getPatients() {
        return integrationService.getPatients();
    }

    @GetMapping("/staff")
    public List<StaffSummary> getStaff() {
        return integrationService.getStaff();
    }
}
