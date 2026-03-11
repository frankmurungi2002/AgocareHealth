package com.agrocare.model.sql;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User author;

    // Legacy text category (kept for backward compatibility)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private QuestionCategory category;

    // New normalized category FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category categoryEntity;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private QuestionStatus status = QuestionStatus.OPEN;

    @Column(nullable = false)
    @Builder.Default
    private Integer upvotes = 0;

    @Column(name = "downvote_count")
    @Builder.Default
    private Integer downvoteCount = 0;

    @Column(name = "answer_count", nullable = false)
    @Builder.Default
    private Integer answerCount = 0;

    @Column(name = "medical_answer_count")
    @Builder.Default
    private Integer medicalAnswerCount = 0;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "comment_count")
    @Builder.Default
    private Integer commentCount = 0;

    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;

    @Column(name = "is_resolved")
    @Builder.Default
    private Boolean isResolved = false;

    @Column(name = "is_moderated")
    @Builder.Default
    private Boolean isModerated = false;

    @Column(name = "moderation_status", length = 50)
    @Builder.Default
    private String moderationStatus = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum QuestionCategory {
        PEDIATRICS, PREGNANCY, INFECTIOUS, SEXUAL_HEALTH, MENTAL_HEALTH, GENERAL, DIABETES, HYPERTENSION, NUTRITION
    }

    public enum QuestionStatus {
        OPEN, ANSWERED, CLOSED
    }
}
