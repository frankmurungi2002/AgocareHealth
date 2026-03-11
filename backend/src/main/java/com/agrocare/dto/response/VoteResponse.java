package com.agrocare.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteResponse {

    private String votableType;
    private Long votableId;
    private String voteType;
    private int upvoteCount;
    private int downvoteCount;
    private boolean hasUpvoted;
    private boolean hasDownvoted;
    private String message;
}
