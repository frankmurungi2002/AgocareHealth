package com.agrocare.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteRequest {

    @NotNull(message = "Votable type is required (QUESTION or ANSWER)")
    private String votableType; // "QUESTION" or "ANSWER"

    @NotNull(message = "Votable ID is required")
    private Long votableId;

    @NotNull(message = "Vote type is required (UPVOTE or DOWNVOTE)")
    private String voteType; // "UPVOTE" or "DOWNVOTE"
}
