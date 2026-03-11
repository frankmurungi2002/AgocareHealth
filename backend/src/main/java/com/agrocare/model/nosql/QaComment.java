package com.agrocare.model.nosql;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * MongoDB document for comments on questions and answers.
 * Uses polymorphic pattern: commentableType + commentableId reference
 * either a PostgreSQL Question or Answer.
 */
@Document(collection = "qa_comments")
@CompoundIndexes({
    @CompoundIndex(name = "idx_commentable", def = "{'commentableType': 1, 'commentableId': 1}"),
    @CompoundIndex(name = "idx_parent", def = "{'parentCommentId': 1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QaComment {

    @Id
    private String id;

    @Indexed
    private Long userId;

    private String username;
    private String userType;        // PATIENT, MEDICAL_PROFESSIONAL, VERIFIED_DOCTOR
    private String profilePicture;

    private String commentableType; // "QUESTION" or "ANSWER"
    private Long commentableId;     // PostgreSQL question/answer ID

    private String content;

    private String parentCommentId; // For nested replies (null = top-level comment)

    @Builder.Default
    private Integer likes = 0;

    @Indexed
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
