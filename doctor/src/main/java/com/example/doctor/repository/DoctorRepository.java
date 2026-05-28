package com.example.doctor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.doctor.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
