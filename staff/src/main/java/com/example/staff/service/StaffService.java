package com.example.staff.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.staff.entity.Staff;
import com.example.staff.repository.StaffRepository;

@Service
public class StaffService {

    private final StaffRepository repository;

    public StaffService(StaffRepository repository) {
        this.repository = repository;
    }

    public Staff saveStaff(Staff staff) {
        return repository.save(staff);
    }

    public List<Staff> getAllStaff() {
        return repository.findAll();
    }

    public Staff getStaffById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff member not found"));
    }

    public Staff updateStaff(Long id, Staff updated) {
        Staff existing = getStaffById(id);
        existing.setName(updated.getName());
        existing.setRole(updated.getRole());
        existing.setDepartment(updated.getDepartment());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        return repository.save(existing);
    }

    public void deleteStaff(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff member not found");
        }
        repository.deleteById(id);
    }
}
