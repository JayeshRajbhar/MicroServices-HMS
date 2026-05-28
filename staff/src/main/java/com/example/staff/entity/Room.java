package com.example.staff.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "roomNumber is required")
    @Size(max = 50, message = "roomNumber must be at most 50 characters")
    @Column(nullable = false, length = 50)
    private String roomNumber;

    @NotBlank(message = "wing is required")
    @Size(max = 100, message = "wing must be at most 100 characters")
    @Column(nullable = false, length = 100)
    private String wing;

    @NotBlank(message = "status is required")
    @Size(max = 30, message = "status must be at most 30 characters")
    @Column(nullable = false, length = 30)
    private String status;

    @Size(max = 200, message = "assignedPatient must be at most 200 characters")
    @Column(length = 200)
    private String assignedPatient;

    public Room() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getWing() {
        return wing;
    }

    public void setWing(String wing) {
        this.wing = wing;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedPatient() {
        return assignedPatient;
    }

    public void setAssignedPatient(String assignedPatient) {
        this.assignedPatient = assignedPatient;
    }
}
