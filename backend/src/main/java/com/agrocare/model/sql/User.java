package com.agrocare.model.sql;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", length = 30)
    @Builder.Default
    private UserType userType = UserType.PATIENT;

    @Column(name = "verification_badge")
    @Builder.Default
    private Boolean verificationBadge = false;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    // Social Authentication Fields
    @Column(name = "google_id")
    private String googleId;

    @Column(name = "facebook_id")
    private String facebookId;

    @Column(name = "apple_id")
    private String appleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", length = 50)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        PATIENT, DOCTOR, NURSE, PROFESSOR, ADMIN, MODERATOR, HEALTH_WORKER
    }

    public enum UserType {
        PATIENT, MEDICAL_PROFESSIONAL, VERIFIED_DOCTOR
    }

    public enum AuthProvider {
        LOCAL, GOOGLE, FACEBOOK, APPLE
    }

    /** Check if user is a medical professional (doctor, nurse, professor, or health worker) */
    public boolean isMedicalProfessional() {
        return this.role == UserRole.DOCTOR || this.role == UserRole.NURSE
            || this.role == UserRole.PROFESSOR || this.role == UserRole.HEALTH_WORKER
            || this.userType == UserType.MEDICAL_PROFESSIONAL
            || this.userType == UserType.VERIFIED_DOCTOR;
    }
}
