package com.agrocare.model.nosql;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * MongoDB document for user notifications.
 * Triggered by actions like new answers, comments, upvotes, follows, etc.
 */
@Document(collection = "notifications")
@CompoundIndexes({
    @CompoundIndex(name = "idx_user_read_time", def = "{'userId': 1, 'isRead': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_user_time", def = "{'userId': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    private Long userId;            // Recipient

    private String type;            // NEW_ANSWER, COMMENT, UPVOTE, FOLLOW, ACCEPTED_ANSWER

    private String referenceType;   // QUESTION, ANSWER, COMMENT
    private Long referenceId;       // PostgreSQL ID of the referenced entity

    private Long actorId;           // Who triggered the notification
    private String actorName;

    private String message;

    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime createdAt;
}
