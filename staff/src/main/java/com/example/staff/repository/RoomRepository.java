package com.example.staff.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.staff.entity.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
