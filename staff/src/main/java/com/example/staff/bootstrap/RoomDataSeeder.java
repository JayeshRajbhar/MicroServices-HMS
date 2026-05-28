package com.example.staff.bootstrap;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.staff.entity.Room;
import com.example.staff.repository.RoomRepository;

@Component
public class RoomDataSeeder implements CommandLineRunner {

    private final RoomRepository repository;

    public RoomDataSeeder(RoomRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        List<Room> rooms = List.of(
                buildRoom("Room 101", "East Wing", "OCCUPIED", "James Carter"),
                buildRoom("Room 102", "East Wing", "OCCUPIED", "Alicia Moore"),
                buildRoom("Room 103", "East Wing", "AVAILABLE", null),
                buildRoom("Room 104", "East Wing", "CLEANING", null),
                buildRoom("Room 201", "West Wing", "OCCUPIED", "Helen Brooks"),
                buildRoom("Room 202", "West Wing", "OCCUPIED", "Noah Vega"),
                buildRoom("Room 203", "West Wing", "AVAILABLE", null),
                buildRoom("Room 204", "West Wing", "MAINTENANCE", null),
                buildRoom("Room 301", "North Wing", "OCCUPIED", "Samuel Diaz"),
                buildRoom("Room 302", "North Wing", "AVAILABLE", null)
        );

        repository.saveAll(rooms);
    }

    private Room buildRoom(String roomNumber, String wing, String status, String assignedPatient) {
        Room room = new Room();
        room.setRoomNumber(roomNumber);
        room.setWing(wing);
        room.setStatus(status);
        room.setAssignedPatient(assignedPatient);
        return room;
    }
}
