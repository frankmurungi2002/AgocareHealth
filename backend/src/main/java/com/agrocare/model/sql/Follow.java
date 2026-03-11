package com.agrocare.model.sql;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_follows_follower_followable",
           columnNames = {"follower_id", "followable_type", "followable_id"}
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @Enumerated(EnumType.STRING)
    @Column(name = "followable_type", nullable = false, length = 20)
    private FollowableType followableType;

    @Column(name = "followable_id", nullable = false)
    private Long followableId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum FollowableType {
        USER, QUESTION, CATEGORY
    }
}
