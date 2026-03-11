package com.agrocare.controller;

import com.agrocare.dto.UserDTO;
import com.agrocare.model.sql.User;
import com.agrocare.service.AuthService;
import com.agrocare.service.OAuthService;
import com.agrocare.service.OAuthUserInfo;
import com.agrocare.service.OAuthAuthResult;
import com.agrocare.service.OAuthTokenResponse;
import com.agrocare.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * User registration endpoint
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        try {
            String username = data.get("username");
            String email = data.get("email");
            String password = data.get("password");
            String name = data.get("name");
            String role = data.getOrDefault("role", "PATIENT");
            
            User user = authService.register(username, email, password, name, role);
            UserDTO userDTO = convertToDTO(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", userDTO);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * User login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            
            String token = authService.login(username, password);
            UserDTO user = authService.getUserByUsername(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get current user profile
     * GET /api/auth/me/:userId
     */
    @GetMapping("/me/{userId}")
    public ResponseEntity<?> getCurrentUser(@PathVariable Long userId) {
        try {
            UserDTO user = authService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Update user profile
     * PUT /api/auth/update/:userId
     */
    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String profilePicture) {
        try {
            User updatedUser = authService.updateUserProfile(userId, name, bio, profilePicture);
            UserDTO userDTO = convertToDTO(updatedUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", userDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Change password
     * POST /api/auth/change-password/:userId
     */
    @PostMapping("/change-password/{userId}")
    public ResponseEntity<?> changePassword(@PathVariable Long userId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        try {
            authService.changePassword(userId, oldPassword, newPassword);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get users by role
     * GET /api/auth/users/:role
     */
    @GetMapping("/users/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            List<UserDTO> users = authService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Deactivate user account
     * POST /api/auth/deactivate/:userId
     */
    @PostMapping("/deactivate/{userId}")
    public ResponseEntity<?> deactivateAccount(@PathVariable Long userId) {
        try {
            authService.deactivateUser(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Account deactivated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @Autowired
    private OAuthService oAuthService;

    // ========== OAuth Endpoints ==========
    
    /**
     * Token-based OAuth: Frontend sends provider token, backend verifies and creates/links user
     * POST /api/auth/oauth/{provider}/token
     */
    @PostMapping("/oauth/{provider}/token")
    public ResponseEntity<?> handleOAuthToken(
            @PathVariable String provider,
            @RequestBody Map<String, String> body) {
        try {
            String accessToken = body.get("accessToken");
            String idToken = body.get("idToken");
            String providerName = provider.toLowerCase();
            
            if (accessToken == null && idToken == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No token provided");
                return ResponseEntity.badRequest().body(error);
            }
            
            OAuthUserInfo userInfo;
            
            switch (providerName) {
                case "google":
                    // Google: verify ID token or use access token to get user info
                    if (accessToken != null) {
                        userInfo = oAuthService.getGoogleUserInfo(accessToken);
                    } else {
                        userInfo = oAuthService.verifyGoogleIdToken(idToken);
                    }
                    break;
                case "facebook":
                    userInfo = oAuthService.getFacebookUserInfo(accessToken);
                    break;
                case "apple":
                    userInfo = oAuthService.getAppleUserInfo(idToken);
                    break;
                default:
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Unsupported provider: " + provider);
                    return ResponseEntity.badRequest().body(error);
            }
            
            // Process login: find or create user, generate JWT
            OAuthAuthResult result = oAuthService.processOAuthLogin(userInfo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OAuth login successful");
            response.put("token", result.getToken());
            response.put("user", result.getUser());
            response.put("isNewUser", result.isNewUser());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("OAuth token error for " + provider + ": " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "OAuth authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Redirect-based OAuth: Redirects browser to provider's consent page
     * GET /api/auth/oauth/{provider}
     */
    @GetMapping("/oauth/{provider}")
    public void initiateOAuthLogin(@PathVariable String provider, HttpServletResponse response) throws IOException {
        try {
            String state = UUID.randomUUID().toString();
            String authUrl;
            
            switch (provider.toLowerCase()) {
                case "google":
                    authUrl = oAuthService.getGoogleAuthorizationUrl(state);
                    break;
                case "facebook":
                    authUrl = oAuthService.getFacebookAuthorizationUrl(state);
                    break;
                default:
                    response.sendRedirect("/html/Login.html?error=unsupported_provider");
                    return;
            }
            response.sendRedirect(authUrl);
        } catch (Exception e) {
            response.sendRedirect("/html/Login.html?error=" + e.getMessage());
        }
    }
    
    @GetMapping("/oauth/{provider}/callback")
    public void handleOAuthCallback(
            @PathVariable String provider,
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {
        
        try {
            // Exchange code for tokens
            OAuthTokenResponse tokens = oAuthService.exchangeCodeForTokens(code, provider);
            
            // Get user info
            OAuthUserInfo userInfo;
            switch (provider.toLowerCase()) {
                case "google":
                    userInfo = oAuthService.getGoogleUserInfo(tokens.getAccessToken());
                    break;
                case "facebook":
                    userInfo = oAuthService.getFacebookUserInfo(tokens.getAccessToken());
                    break;
                default:
                    response.sendRedirect("/html/Login.html?error=unsupported_provider");
                    return;
            }
            
            // Process login
            OAuthAuthResult result = oAuthService.processOAuthLogin(userInfo);
            
            // Redirect to frontend with token
            String redirectUrl = String.format("/html/oauth-callback.html?token=%s&user=%s",
                java.net.URLEncoder.encode(result.getToken(), "UTF-8"),
                java.net.URLEncoder.encode(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result.getUser()), "UTF-8"));
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            response.sendRedirect("/html/Login.html?error=" + java.net.URLEncoder.encode(e.getMessage(), "UTF-8"));
        }
    }

    /**
     * Convert User to UserDTO
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
