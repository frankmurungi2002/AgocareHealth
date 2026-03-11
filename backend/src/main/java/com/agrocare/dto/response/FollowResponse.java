package com.agrocare.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowResponse {

    private String followableType;
    private Long followableId;
    private boolean isFollowing;
    private int followerCount;
    private String message;
}
