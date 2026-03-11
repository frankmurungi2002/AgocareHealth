package com.agrocare.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthUserInfo {
    private String provider;
    private String providerId;
    private String email;
    private String name;
    private String picture;
    private boolean verifiedEmail;
}
