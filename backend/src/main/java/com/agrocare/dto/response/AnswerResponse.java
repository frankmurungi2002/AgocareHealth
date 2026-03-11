package com.agrocare.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponse {

    private Long id;
    private Long questionId;
    private String content;
    private boolean isAccepted;
    private AuthorDTO author;
    private StatsDTO stats;
    private UserInteractionDTO userInteraction;
    private String timeAgo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorDTO {
        private Long id;
        private String username;
        private String name;
        private String initials;
        private String profilePicture;
        private boolean verificationBadge;
        private String userType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsDTO {
        private int upvotes;
        private int downvotes;
        private int comments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInteractionDTO {
        private boolean hasUpvoted;
        private boolean hasDownvoted;
    }
}
