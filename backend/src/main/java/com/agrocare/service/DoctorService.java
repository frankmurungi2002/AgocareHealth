package com.agrocare.service;

import com.agrocare.dto.DoctorProfileDTO;
import com.agrocare.model.sql.DoctorProfile;
import com.agrocare.model.sql.User;
import com.agrocare.repository.sql.DoctorProfileRepository;
import com.agrocare.repository.sql.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create doctor profile
     */
    public DoctorProfile createDoctorProfile(Long userId, String specialization, String licenseNumber,
                                              String hospitalAffiliation, Integer yearsOfExperience,
                                              String consultationFee) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .specialization(specialization)
                .licenseNumber(licenseNumber)
                .hospitalAffiliation(hospitalAffiliation)
                .yearsOfExperience(yearsOfExperience != null ? yearsOfExperience : 0)
                .rating(0.0)
                .totalConsultations(0)
                .isAvailable(true)
                .consultationFee(consultationFee)
                .build();

        return doctorProfileRepository.save(profile);
    }

    /**
     * Get doctor profile by user ID
     */
    public DoctorProfileDTO getDoctorProfile(Long userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return convertToDTO(profile);
    }

    /**
     * Get doctor profile by ID
     */
    public DoctorProfileDTO getDoctorProfileById(Long profileId) {
        DoctorProfile profile = doctorProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return convertToDTO(profile);
    }

    /**
     * Get doctors by specialization
     */
    public List<DoctorProfileDTO> getDoctorsBySpecialization(String specialization) {
        return doctorProfileRepository.findBySpecialization(specialization)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get available doctors.
     * Also auto-creates default profiles for DOCTOR-role users who are missing them,
     * so that all doctors in the system are discoverable by patients.
     */
    public List<DoctorProfileDTO> getAvailableDoctors() {
        // Ensure all DOCTOR-role users have a profile
        ensureAllDoctorsHaveProfiles();

        return doctorProfileRepository.findByIsAvailableTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Auto-create default doctor profiles for any medical-professional-role users missing one.
     * Covers DOCTOR, NURSE, PROFESSOR, and HEALTH_WORKER roles.
     */
    private void ensureAllDoctorsHaveProfiles() {
        List<User.UserRole> medicalRoles = List.of(
            User.UserRole.DOCTOR, User.UserRole.NURSE,
            User.UserRole.PROFESSOR, User.UserRole.HEALTH_WORKER
        );
        for (User.UserRole role : medicalRoles) {
            List<User> users = userRepository.findByRole(role);
            for (User doctor : users) {
                if (doctorProfileRepository.findByUserId(doctor.getId()).isEmpty()) {
                    String defaultSpec = switch (role) {
                        case DOCTOR -> "General Practice";
                        case NURSE -> "Nursing";
                        case PROFESSOR -> "Medical Research";
                        default -> "General Practice";
                    };
                    DoctorProfile profile = DoctorProfile.builder()
                            .user(doctor)
                            .specialization(defaultSpec)
                            .licenseNumber("PENDING-" + doctor.getId())
                            .hospitalAffiliation("")
                            .yearsOfExperience(0)
                            .rating(0.0)
                            .totalConsultations(0)
                            .isAvailable(true)
                            .build();
                    doctorProfileRepository.save(profile);
                }
            }
        }
    }

    /**
     * Get top-rated doctors
     */
    public List<DoctorProfileDTO> getTopRatedDoctors(Double minRating) {
        return doctorProfileRepository.findByRatingGreaterThanEqual(minRating)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update doctor profile
     */
    public DoctorProfile updateDoctorProfile(Long userId, String specialization, String hospitalAffiliation,
                                             Integer yearsOfExperience, String consultationFee) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (specialization != null && !specialization.isEmpty()) {
            profile.setSpecialization(specialization);
        }
        if (hospitalAffiliation != null) {
            profile.setHospitalAffiliation(hospitalAffiliation);
        }
        if (yearsOfExperience != null) {
            profile.setYearsOfExperience(yearsOfExperience);
        }
        if (consultationFee != null) {
            profile.setConsultationFee(consultationFee);
        }

        return doctorProfileRepository.save(profile);
    }

    /**
     * Update doctor availability
     */
    public void updateAvailability(Long userId, Boolean isAvailable) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        profile.setIsAvailable(isAvailable);
        doctorProfileRepository.save(profile);
    }

    /**
     * Update doctor rating
     */
    public void updateRating(Long profileId, Double newRating) {
        DoctorProfile profile = doctorProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        profile.setRating(newRating);
        doctorProfileRepository.save(profile);
    }

    /**
     * Increment consultation count
     */
    public void incrementConsultationCount(Long userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        profile.setTotalConsultations(profile.getTotalConsultations() + 1);
        doctorProfileRepository.save(profile);
    }

    /**
     * Convert DoctorProfile entity to DoctorProfileDTO
     */
    private DoctorProfileDTO convertToDTO(DoctorProfile profile) {
        User user = profile.getUser();
        return DoctorProfileDTO.builder()
                .id(profile.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .specialization(profile.getSpecialization())
                .licenseNumber(profile.getLicenseNumber())
                .medicalCertificate(profile.getMedicalCertificate())
                .hospitalAffiliation(profile.getHospitalAffiliation())
                .yearsOfExperience(profile.getYearsOfExperience())
                .rating(profile.getRating())
                .totalConsultations(profile.getTotalConsultations())
                .isAvailable(profile.getIsAvailable())
                .consultationFee(profile.getConsultationFee())
                .build();
    }
}
