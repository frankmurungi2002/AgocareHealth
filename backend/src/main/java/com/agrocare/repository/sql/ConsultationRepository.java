package com.agrocare.repository.sql;

import com.agrocare.model.sql.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByDoctorId(Long doctorId);
    List<Consultation> findByPatientId(Long patientId);
    List<Consultation> findByDoctorIdAndStatus(Long doctorId, Consultation.ConsultationStatus status);
    List<Consultation> findByPatientIdAndStatus(Long patientId, Consultation.ConsultationStatus status);
    List<Consultation> findByAppointmentId(Long appointmentId);
}
