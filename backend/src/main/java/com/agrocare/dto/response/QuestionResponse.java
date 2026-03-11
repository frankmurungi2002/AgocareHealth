package com.agrocare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionResponse {

    private Long id;
    private String title;
    private String body;

    private AuthorDTO author;
    private CategoryDTO category;
    private StatsDTO stats;
    private UserInteractionDTO userInteractions;

    private String status;
    private Boolean isAnonymous;
    private String relativeTime;
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
        private Boolean verificationBadge;
        private String userType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDTO {
        private Long id;
        private String name;
        private String slug;
        private String icon;
        private String colorCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsDTO {
        private Integer views;
        private Integer upvotes;
        private Integer downvotes;
        private Integer answers;
        private Integer medicalAnswers;
        private Integer comments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInteractionDTO {
        @Builder.Default
        private Boolean hasUpvoted = false;
        @Builder.Default
        private Boolean hasDownvoted = false;
        @Builder.Default
        private Boolean isFollowing = false;
    }
}
