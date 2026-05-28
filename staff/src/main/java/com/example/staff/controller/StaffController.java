package com.example.staff.controller;

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

import com.example.staff.entity.Staff;
import com.example.staff.integration.DoctorSummary;
import com.example.staff.integration.PatientSummary;
import com.example.staff.integration.StaffIntegrationService;
import com.example.staff.service.StaffService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/staff")
@CrossOrigin("*")
public class StaffController {

    private final StaffService service;
    private final StaffIntegrationService integrationService;

    public StaffController(StaffService service, StaffIntegrationService integrationService) {
        this.service = service;
        this.integrationService = integrationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Staff addStaff(@Valid @RequestBody Staff staff) {
        return service.saveStaff(staff);
    }

    @GetMapping
    public List<Staff> getStaff() {
        return service.getAllStaff();
    }

    @GetMapping("/{id}")
    public Staff getStaffMember(@PathVariable Long id) {
        return service.getStaffById(id);
    }

    @PutMapping("/{id}")
    public Staff updateStaff(@PathVariable Long id, @Valid @RequestBody Staff staff) {
        return service.updateStaff(id, staff);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStaff(@PathVariable Long id) {
        service.deleteStaff(id);
    }

    @GetMapping("/patients")
    public List<PatientSummary> getPatients() {
        return integrationService.getPatients();
    }

    @GetMapping("/doctors")
    public List<DoctorSummary> getDoctors() {
        return integrationService.getDoctors();
    }
}
