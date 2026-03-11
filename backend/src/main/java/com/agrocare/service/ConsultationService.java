package com.agrocare.service;

import com.agrocare.dto.ConsultationDTO;
import com.agrocare.model.sql.Appointment;
import com.agrocare.model.sql.Consultation;
import com.agrocare.model.sql.User;
import com.agrocare.repository.sql.AppointmentRepository;
import com.agrocare.repository.sql.ConsultationRepository;
import com.agrocare.repository.sql.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsultationService {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Consultation createConsultation(Long patientId, Long doctorId, Long appointmentId, String symptoms) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Consultation.ConsultationBuilder builder = Consultation.builder()
                .patient(patient)
                .doctor(doctor)
                .symptoms(symptoms)
                .status(Consultation.ConsultationStatus.IN_PROGRESS);

        if (appointmentId != null) {
            Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
            if (appointment != null) {
                builder.appointment(appointment);
            }
        }

        return consultationRepository.save(builder.build());
    }

    public ConsultationDTO getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));
        return convertToDTO(consultation);
    }

    public List<ConsultationDTO> getDoctorConsultations(Long doctorId) {
        return consultationRepository.findByDoctorId(doctorId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ConsultationDTO> getPatientConsultations(Long patientId) {
        return consultationRepository.findByPatientId(patientId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ConsultationDTO> getPendingConsultations(Long doctorId) {
        return consultationRepository.findByDoctorIdAndStatus(doctorId, Consultation.ConsultationStatus.IN_PROGRESS)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public Consultation updateConsultation(Long id, String symptoms, String diagnosis, String notes, String status) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));

        if (symptoms != null && !symptoms.isEmpty()) consultation.setSymptoms(symptoms);
        if (diagnosis != null && !diagnosis.isEmpty()) consultation.setDiagnosis(diagnosis);
        if (notes != null) consultation.setNotes(notes);
        if (status != null && !status.isEmpty()) {
            try {
                consultation.setStatus(Consultation.ConsultationStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + status);
            }
        }

        return consultationRepository.save(consultation);
    }

    public void completeConsultation(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));
        consultation.setStatus(Consultation.ConsultationStatus.COMPLETED);
        consultationRepository.save(consultation);
    }

    public void saveDraft(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));
        consultation.setStatus(Consultation.ConsultationStatus.DRAFT);
        consultationRepository.save(consultation);
    }

    private ConsultationDTO convertToDTO(Consultation consultation) {
        return ConsultationDTO.builder()
                .id(consultation.getId())
                .patientId(consultation.getPatient().getId())
                .patientName(consultation.getPatient().getName())
                .doctorId(consultation.getDoctor().getId())
                .doctorName(consultation.getDoctor().getName())
                .appointmentId(consultation.getAppointment() != null ? consultation.getAppointment().getId() : null)
                .consultationDate(consultation.getConsultationDate() != null ? consultation.getConsultationDate().toString() : null)
                .symptoms(consultation.getSymptoms())
                .diagnosis(consultation.getDiagnosis())
                .notes(consultation.getNotes())
                .status(consultation.getStatus().name())
                .createdAt(consultation.getCreatedAt() != null ? consultation.getCreatedAt().toString() : null)
                .updatedAt(consultation.getUpdatedAt() != null ? consultation.getUpdatedAt().toString() : null)
                .build();
    }
}
