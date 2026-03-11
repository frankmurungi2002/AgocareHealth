package com.agrocare.service;

import com.agrocare.dto.UserDTO;
import com.agrocare.model.sql.User;
import com.agrocare.repository.sql.UserRepository;
import com.agrocare.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class OAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:}")
    private String googleRedirectUri;

    @Value("${spring.security.oauth2.client.registration.facebook.client-id:}")
    private String facebookClientId;

    @Value("${spring.security.oauth2.client.registration.facebook.client-secret:}")
    private String facebookClientSecret;

    @Value("${spring.security.oauth2.client.registration.facebook.redirect-uri:}")
    private String facebookRedirectUri;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    public OAuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        log.info("OAuthService initialized with Google Client ID: {}", googleClientId);
    }

    public String getGoogleAuthorizationUrl(String state) {
        if (googleClientId == null || googleClientId.isEmpty()) {
            log.error("Google Client ID is not configured!");
            throw new RuntimeException("Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in .env");
        }
        
        String scope = "openid email profile";
        return String.format(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s&access_type=offline",
            googleClientId,
            googleRedirectUri,
            scope,
            state
        );
    }

    public String getFacebookAuthorizationUrl(String state) {
        if (facebookClientId == null || facebookClientId.isEmpty()) {
            log.error("Facebook Client ID is not configured!");
            throw new RuntimeException("Facebook OAuth is not configured. Please set FACEBOOK_APP_ID in .env");
        }
        
        String scope = "email,public_profile";
        return String.format(
            "https://www.facebook.com/v18.0/dialog/oauth?client_id=%s&redirect_uri=%s&state=%s&scope=%s",
            facebookClientId,
            facebookRedirectUri,
            state,
            scope
        );
    }

    public String getAppleAuthorizationUrl(String state) {
        log.warn("Apple OAuth is not fully implemented yet");
        throw new RuntimeException("Apple OAuth is not yet fully implemented");
    }

    public OAuthTokenResponse exchangeCodeForTokens(String code, String provider) {
        try {
            switch (provider.toLowerCase()) {
                case "google":
                    return exchangeGoogleCode(code);
                case "facebook":
                    return exchangeFacebookCode(code);
                default:
                    throw new IllegalArgumentException("Unknown OAuth provider: " + provider);
            }
        } catch (Exception e) {
            log.error("Error exchanging code for tokens: {}", e.getMessage());
            throw new RuntimeException("Failed to exchange authorization code: " + e.getMessage());
        }
    }

    private OAuthTokenResponse exchangeGoogleCode(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";
        
        String requestBody = String.format(
            "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
            code, googleClientId, googleClientSecret, googleRedirectUri
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        String response = restTemplate.postForObject(tokenUrl, entity, String.class);

        try {
            JsonNode json = objectMapper.readTree(response);
            return OAuthTokenResponse.builder()
                .accessToken(json.get("access_token").asText())
                .idToken(json.has("id_token") ? json.get("id_token").asText() : null)
                .expiresIn(json.get("expires_in").asInt())
                .refreshToken(json.has("refresh_token") ? json.get("refresh_token").asText() : null)
                .build();
        } catch (Exception e) {
            log.error("Error parsing Google token response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Google token response");
        }
    }

    private OAuthTokenResponse exchangeFacebookCode(String code) {
        String tokenUrl = String.format(
            "https://graph.facebook.com/v18.0/oauth/access_token?code=%s&client_id=%s&client_secret=%s&redirect_uri=%s",
            code, facebookClientId, facebookClientSecret, facebookRedirectUri
        );

        String response = restTemplate.getForObject(tokenUrl, String.class);

        try {
            JsonNode json = objectMapper.readTree(response);
            return OAuthTokenResponse.builder()
                .accessToken(json.get("access_token").asText())
                .expiresIn(json.has("expires_in") ? json.get("expires_in").asInt() : 3600)
                .build();
        } catch (Exception e) {
            log.error("Error parsing Facebook token response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Facebook token response");
        }
    }

    public OAuthUserInfo getGoogleUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        String response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, String.class).getBody();

        try {
            JsonNode json = objectMapper.readTree(response);
            return OAuthUserInfo.builder()
                .provider("google")
                .providerId(json.get("id").asText())
                .email(json.get("email").asText())
                .name(json.has("name") ? json.get("name").asText() : null)
                .picture(json.has("picture") ? json.get("picture").asText() : null)
                .verifiedEmail(json.has("verified_email") && json.get("verified_email").asBoolean())
                .build();
        } catch (Exception e) {
            log.error("Error parsing Google user info: {}", e.getMessage());
            throw new RuntimeException("Failed to get Google user info");
        }
    }

    /**
     * Verify a Google ID token (from Google Sign-In JS SDK) and extract user info
     */
    public OAuthUserInfo verifyGoogleIdToken(String idToken) {
        String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        
        try {
            String response = restTemplate.getForObject(tokenInfoUrl, String.class);
            JsonNode json = objectMapper.readTree(response);
            
            // Verify the token audience matches our client ID
            String aud = json.has("aud") ? json.get("aud").asText() : null;
            if (googleClientId != null && !googleClientId.isEmpty() && !googleClientId.equals(aud)) {
                log.warn("Google ID token audience mismatch: expected {}, got {}", googleClientId, aud);
            }
            
            return OAuthUserInfo.builder()
                .provider("google")
                .providerId(json.get("sub").asText())
                .email(json.has("email") ? json.get("email").asText() : null)
                .name(json.has("name") ? json.get("name").asText() : null)
                .picture(json.has("picture") ? json.get("picture").asText() : null)
                .verifiedEmail(json.has("email_verified") && "true".equals(json.get("email_verified").asText()))
                .build();
        } catch (Exception e) {
            log.error("Error verifying Google ID token: {}", e.getMessage());
            throw new RuntimeException("Invalid Google ID token");
        }
    }

    public OAuthUserInfo getFacebookUserInfo(String accessToken) {
        String userInfoUrl = String.format(
            "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=%s",
            accessToken
        );

        String response = restTemplate.getForObject(userInfoUrl, String.class);

        try {
            JsonNode json = objectMapper.readTree(response);
            String picture = null;
            if (json.has("picture") && json.get("picture").has("data")) {
                picture = json.get("picture").get("data").has("url") 
                    ? json.get("picture").get("data").get("url").asText() 
                    : null;
            }
            
            return OAuthUserInfo.builder()
                .provider("facebook")
                .providerId(json.get("id").asText())
                .email(json.has("email") ? json.get("email").asText() : null)
                .name(json.has("name") ? json.get("name").asText() : null)
                .picture(picture)
                .verifiedEmail(true)
                .build();
        } catch (Exception e) {
            log.error("Error parsing Facebook user info: {}", e.getMessage());
            throw new RuntimeException("Failed to get Facebook user info");
        }
    }

    public OAuthUserInfo getAppleUserInfo(String idToken) {
        // Apple Sign-In sends a JWT ID token. We decode the payload to get user info.
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length < 2) {
                throw new RuntimeException("Invalid Apple ID token format");
            }
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            JsonNode json = objectMapper.readTree(payload);
            
            return OAuthUserInfo.builder()
                .provider("apple")
                .providerId(json.has("sub") ? json.get("sub").asText() : UUID.randomUUID().toString())
                .email(json.has("email") ? json.get("email").asText() : null)
                .name(null) // Apple only sends name on first sign-in via separate field
                .verifiedEmail(json.has("email_verified") && "true".equals(json.get("email_verified").asText()))
                .build();
        } catch (Exception e) {
            log.error("Error parsing Apple ID token: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Apple ID token");
        }
    }

    public OAuthAuthResult processOAuthLogin(OAuthUserInfo userInfo) {
        log.info("Processing OAuth login for provider: {}, email: {}", userInfo.getProvider(), userInfo.getEmail());
        
        User user = null;
        boolean isNewUser = false;
        
        // First: try to find by provider ID
        switch (userInfo.getProvider().toLowerCase()) {
            case "google":
                Optional<User> byGoogleId = userRepository.findByGoogleId(userInfo.getProviderId());
                if (byGoogleId.isPresent()) {
                    user = byGoogleId.get();
                }
                break;
            case "facebook":
                Optional<User> byFacebookId = userRepository.findByFacebookId(userInfo.getProviderId());
                if (byFacebookId.isPresent()) {
                    user = byFacebookId.get();
                }
                break;
            case "apple":
                Optional<User> byAppleId = userRepository.findByAppleId(userInfo.getProviderId());
                if (byAppleId.isPresent()) {
                    user = byAppleId.get();
                }
                break;
        }
        
        // Second: try to find by email and link accounts
        if (user == null && userInfo.getEmail() != null && !userInfo.getEmail().isEmpty()) {
            Optional<User> byEmail = userRepository.findByEmail(userInfo.getEmail());
            if (byEmail.isPresent()) {
                User existingUser = byEmail.get();
                linkSocialAccount(existingUser, userInfo);
                user = existingUser;
            }
        }
        
        // Third: create new user
        if (user == null) {
            user = createNewOAuthUser(userInfo);
            isNewUser = true;
        }
        
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());
        
        return OAuthAuthResult.builder()
            .token(token)
            .user(convertToDTO(user))
            .isNewUser(isNewUser)
            .build();
    }

    private void linkSocialAccount(User user, OAuthUserInfo userInfo) {
        switch (userInfo.getProvider().toLowerCase()) {
            case "google":
                if (user.getGoogleId() == null) {
                    user.setGoogleId(userInfo.getProviderId());
                    user.setAuthProvider(User.AuthProvider.GOOGLE);
                }
                break;
            case "facebook":
                if (user.getFacebookId() == null) {
                    user.setFacebookId(userInfo.getProviderId());
                    user.setAuthProvider(User.AuthProvider.FACEBOOK);
                }
                break;
            case "apple":
                if (user.getAppleId() == null) {
                    user.setAppleId(userInfo.getProviderId());
                    user.setAuthProvider(User.AuthProvider.APPLE);
                }
                break;
        }
        // Update profile picture if user doesn't have one
        if (user.getProfilePicture() == null && userInfo.getPicture() != null) {
            user.setProfilePicture(userInfo.getPicture());
        }
        userRepository.save(user);
        log.info("Linked {} account to user: {}", userInfo.getProvider(), user.getEmail());
    }

    private User createNewOAuthUser(OAuthUserInfo userInfo) {
        String username = generateUsername(userInfo);
        String name = userInfo.getName() != null ? userInfo.getName() : username;
        
        User.UserRole role = User.UserRole.PATIENT;
        
        User user = User.builder()
            .username(username)
            .email(userInfo.getEmail() != null ? userInfo.getEmail() : username + "@placeholder.local")
            .password(new BCryptPasswordEncoder().encode(UUID.randomUUID().toString()))
            .name(name)
            .role(role)
            .profilePicture(userInfo.getPicture())
            .isActive(true)
            .isVerified(userInfo.isVerifiedEmail())
            .authProvider(User.AuthProvider.valueOf(userInfo.getProvider().toUpperCase()))
            .build();
        
        switch (userInfo.getProvider().toLowerCase()) {
            case "google":
                user.setGoogleId(userInfo.getProviderId());
                break;
            case "facebook":
                user.setFacebookId(userInfo.getProviderId());
                break;
            case "apple":
                user.setAppleId(userInfo.getProviderId());
                break;
        }
        
        User savedUser = userRepository.save(user);
        log.info("Created new OAuth user: {} with provider: {}", savedUser.getEmail(), userInfo.getProvider());
        
        return savedUser;
    }

    private String generateUsername(OAuthUserInfo userInfo) {
        String baseUsername;
        if (userInfo.getEmail() != null && !userInfo.getEmail().isEmpty()) {
            baseUsername = userInfo.getEmail().split("@")[0];
        } else {
            baseUsername = userInfo.getProvider() + "_user";
        }
        
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter;
            counter++;
        }
        
        return username;
    }

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
