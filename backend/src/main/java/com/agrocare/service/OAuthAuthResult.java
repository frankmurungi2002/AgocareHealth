package com.agrocare.service;

import com.agrocare.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthAuthResult {
    private String token;
    private UserDTO user;
    private boolean isNewUser;
}
