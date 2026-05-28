package com.example.doctor.integration;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class DoctorIntegrationService {

    private final RestClient patientClient;
    private final RestClient staffClient;

    public DoctorIntegrationService(RestClient.Builder builder,
            @Value("${services.patient.base-url}") String patientBaseUrl,
            @Value("${services.staff.base-url}") String staffBaseUrl) {
        this.patientClient = builder.baseUrl(patientBaseUrl).build();
        this.staffClient = builder.baseUrl(staffBaseUrl).build();
    }

    public List<PatientSummary> getPatients() {
        try {
            String authHeader = resolveAuthHeader();
            RestClient.RequestHeadersSpec<?> request = patientClient.get().uri("/patients");
            if (authHeader != null && !authHeader.isBlank()) {
                request = request.header(HttpHeaders.AUTHORIZATION, authHeader);
            }
            return request.retrieve()
                    .body(new ParameterizedTypeReference<List<PatientSummary>>() {
                    });
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Patient service unavailable", ex);
        }
    }

    public List<StaffSummary> getStaff() {
        try {
            String authHeader = resolveAuthHeader();
            RestClient.RequestHeadersSpec<?> request = staffClient.get().uri("/staff");
            if (authHeader != null && !authHeader.isBlank()) {
                request = request.header(HttpHeaders.AUTHORIZATION, authHeader);
            }
            return request.retrieve()
                    .body(new ParameterizedTypeReference<List<StaffSummary>>() {
                    });
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Staff service unavailable", ex);
        }
    }

    private String resolveAuthHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        HttpServletRequest request = attributes.getRequest();
        return request.getHeader(HttpHeaders.AUTHORIZATION);
    }
}
