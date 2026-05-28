package com.example.staff.entity;

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
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "name is required")
    @Size(max = 200, message = "name must be at most 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "role is required")
    @Size(max = 100, message = "role must be at most 100 characters")
    @Column(nullable = false, length = 100)
    private String role;

    @Size(max = 200, message = "department must be at most 200 characters")
    @Column(length = 200)
    private String department;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    @Size(max = 200, message = "email must be at most 200 characters")
    @Column(nullable = false, length = 200)
    private String email;

    @Size(max = 30, message = "phone must be at most 30 characters")
    @Column(length = 30)
    private String phone;

    public Staff() {
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
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
