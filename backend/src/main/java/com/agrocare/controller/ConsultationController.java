package com.agrocare.controller;

import com.agrocare.dto.ConsultationDTO;
import com.agrocare.model.sql.Consultation;
import com.agrocare.service.ConsultationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/consultations")
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    /**
     * Create a consultation
     * POST /api/consultations/create?patientId=&doctorId=&appointmentId=&symptoms=
     */
    @PostMapping("/create")
    public ResponseEntity<?> createConsultation(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestParam(required = false) Long appointmentId,
            @RequestParam(required = false) String symptoms) {
        try {
            Consultation consultation = consultationService.createConsultation(patientId, doctorId, appointmentId, symptoms);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Consultation created successfully");
            response.put("consultation", consultationService.getConsultationById(consultation.getId()));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get consultation by ID
     * GET /api/consultations/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getConsultation(@PathVariable Long id) {
        try {
            ConsultationDTO consultation = consultationService.getConsultationById(id);
            return ResponseEntity.ok(consultation);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get doctor consultations
     * GET /api/consultations/doctor/:doctorId
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorConsultations(@PathVariable Long doctorId) {
        try {
            List<ConsultationDTO> consultations = consultationService.getDoctorConsultations(doctorId);
            return ResponseEntity.ok(consultations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get patient consultations
     * GET /api/consultations/patient/:patientId
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientConsultations(@PathVariable Long patientId) {
        try {
            List<ConsultationDTO> consultations = consultationService.getPatientConsultations(patientId);
            return ResponseEntity.ok(consultations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get pending consultations for doctor
     * GET /api/consultations/doctor/:doctorId/pending
     */
    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<?> getPendingConsultations(@PathVariable Long doctorId) {
        try {
            List<ConsultationDTO> consultations = consultationService.getPendingConsultations(doctorId);
            return ResponseEntity.ok(consultations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update consultation
     * PUT /api/consultations/:id?symptoms=&diagnosis=&notes=&status=
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateConsultation(
            @PathVariable Long id,
            @RequestParam(required = false) String symptoms,
            @RequestParam(required = false) String diagnosis,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String status) {
        try {
            Consultation consultation = consultationService.updateConsultation(id, symptoms, diagnosis, notes, status);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Consultation updated successfully");
            response.put("consultation", consultationService.getConsultationById(consultation.getId()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Complete consultation
     * POST /api/consultations/:id/complete
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeConsultation(@PathVariable Long id) {
        try {
            consultationService.completeConsultation(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Consultation completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Save consultation as draft
     * POST /api/consultations/:id/draft
     */
    @PostMapping("/{id}/draft")
    public ResponseEntity<?> saveDraft(@PathVariable Long id) {
        try {
            consultationService.saveDraft(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Consultation saved as draft");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
