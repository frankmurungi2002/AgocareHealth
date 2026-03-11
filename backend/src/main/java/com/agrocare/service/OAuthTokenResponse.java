package com.agrocare.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthTokenResponse {
    private String accessToken;
    private String idToken;
    private Integer expiresIn;
    private String refreshToken;
    private String tokenType;
}
