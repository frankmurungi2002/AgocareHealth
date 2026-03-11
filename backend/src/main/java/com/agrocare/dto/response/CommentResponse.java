package com.agrocare.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private String id;
    private String content;
    private String commentableType;
    private String commentableId;
    private AuthorDTO author;
    private int likes;
    private String parentCommentId;
    private List<CommentResponse> replies;
    private String timeAgo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorDTO {
        private Long userId;
        private String username;
        private String userType;
        private String profilePicture;
        private String initials;
    }
}
