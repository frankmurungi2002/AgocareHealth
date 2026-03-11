package com.agrocare.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private String consultationDate;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private String status;
    private String createdAt;
    private String updatedAt;
}
