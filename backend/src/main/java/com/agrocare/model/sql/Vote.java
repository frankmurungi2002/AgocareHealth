package com.agrocare.model.sql;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_votes_user_votable",
           columnNames = {"user_id", "votable_type", "votable_id"}
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "votable_type", nullable = false, length = 20)
    private VotableType votableType;

    @Column(name = "votable_id", nullable = false)
    private Long votableId;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false, length = 10)
    private VoteType voteType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum VotableType {
        QUESTION, ANSWER
    }

    public enum VoteType {
        UPVOTE, DOWNVOTE
    }
}
