package com.example.staff.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.staff.entity.Staff;

public interface StaffRepository extends JpaRepository<Staff, Long> {
}
