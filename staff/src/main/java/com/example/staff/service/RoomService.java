package com.example.staff.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.staff.entity.Room;
import com.example.staff.repository.RoomRepository;

@Service
public class RoomService {

    private static final int MAX_ROOMS = 10;

    private final RoomRepository repository;

    public RoomService(RoomRepository repository) {
        this.repository = repository;
    }

    public Room saveRoom(Room room) {
        if (repository.count() >= MAX_ROOMS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room limit reached");
        }
        return repository.save(room);
    }

    public List<Room> getAllRooms() {
        return repository.findAll();
    }

    public Room getRoomById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    public Room updateRoom(Long id, Room updated) {
        Room existing = getRoomById(id);
        existing.setRoomNumber(updated.getRoomNumber());
        existing.setWing(updated.getWing());
        existing.setStatus(updated.getStatus());
        existing.setAssignedPatient(updated.getAssignedPatient());
        return repository.save(existing);
    }

    public void deleteRoom(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        repository.deleteById(id);
    }
}
