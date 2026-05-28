package com.example.doctor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "name is required")
    @Size(max = 200, message = "name must be at most 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "specialty is required")
    @Size(max = 200, message = "specialty must be at most 200 characters")
    @Column(nullable = false, length = 200)
    private String specialty;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    @Size(max = 200, message = "email must be at most 200 characters")
    @Column(nullable = false, length = 200)
    private String email;

    @Size(max = 30, message = "phone must be at most 30 characters")
    @Column(length = 30)
    private String phone;

    public Doctor() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
