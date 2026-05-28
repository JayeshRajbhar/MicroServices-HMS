package com.example.patient.bootstrap;

import com.example.patient.entity.Patient;
import com.example.patient.repository.PatientRepository;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true")
public class PatientDataSeeder implements CommandLineRunner {

    private final PatientRepository repository;

    public PatientDataSeeder(PatientRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        Patient alice = new Patient();
        alice.setName("Alice Johnson");
        alice.setDateOfBirth(Date.valueOf(LocalDate.of(1988, 2, 14)));
        alice.setMedicalHistory("Allergy: penicillin");

        Patient bob = new Patient();
        bob.setName("Bob Smith");
        bob.setDateOfBirth(Date.valueOf(LocalDate.of(1992, 7, 3)));
        bob.setMedicalHistory("Asthma");

        Patient clara = new Patient();
        clara.setName("Clara Chen");
        clara.setDateOfBirth(Date.valueOf(LocalDate.of(1979, 11, 22)));
        clara.setMedicalHistory("Type 2 diabetes");

        repository.saveAll(List.of(alice, bob, clara));
    }
}
