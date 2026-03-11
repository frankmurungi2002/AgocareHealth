package com.agrocare.service;

import com.agrocare.dto.UserDTO;
import com.agrocare.model.sql.User;
import com.agrocare.model.sql.DoctorProfile;
import com.agrocare.repository.sql.DoctorProfileRepository;
import com.agrocare.repository.sql.UserRepository;
import com.agrocare.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    /**
     * Register a new user in the system
     */
    public User register(String username, String email, String password, String name, String role) {
        // Check if user already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Map role from frontend to enum
        String roleStr = role != null ? role.toUpperCase() : "PATIENT";
        if (roleStr.equals("COMMUNITY")) {
            roleStr = "PATIENT";
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(User.UserRole.valueOf(roleStr))
                .isActive(true)
                .isVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create doctor profile for medical professionals
        if (roleStr.equals("DOCTOR") || roleStr.equals("NURSE") || roleStr.equals("PROFESSOR")) {
            String defaultSpec = switch (roleStr) {
                case "DOCTOR" -> "General Practice";
                case "NURSE" -> "Nursing";
                case "PROFESSOR" -> "Medical Research";
                default -> "General Practice";
            };
            DoctorProfile profile = DoctorProfile.builder()
                    .user(savedUser)
                    .specialization(defaultSpec)
                    .licenseNumber("PENDING-" + savedUser.getId())
                    .hospitalAffiliation("")
                    .yearsOfExperience(0)
                    .rating(0.0)
                    .totalConsultations(0)
                    .isAvailable(true)
                    .build();
            doctorProfileRepository.save(profile);
        }

        return savedUser;
    }

    /**
     * Authenticate user and generate JWT token
     */
    public String login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Generate JWT token
        return jwtTokenProvider.generateToken(username, user.getRole().name());
    }

    /**
     * Get user by ID
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    /**
     * Get user by username
     */
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(Long userId, String name, String bio, String profilePicture) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (name != null && !name.isEmpty()) {
            user.setName(name);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (profilePicture != null) {
            user.setProfilePicture(profilePicture);
        }

        return userRepository.save(user);
    }

    /**
     * Get all users by role
     */
    public List<UserDTO> getUsersByRole(String role) {
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            return userRepository.findByRole(userRole).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    /**
     * Deactivate user account
     */
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Change user password
     */
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .isActive(user.getIsActive())
                .isVerified(user.getIsVerified())
                .build();
    }
}
