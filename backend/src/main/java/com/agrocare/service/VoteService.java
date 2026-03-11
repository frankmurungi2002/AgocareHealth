package com.agrocare.service;

import com.agrocare.dto.request.VoteRequest;
import com.agrocare.dto.response.VoteResponse;
import com.agrocare.exception.ApiException;
import com.agrocare.model.sql.*;
import com.agrocare.repository.sql.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for voting on questions and answers.
 * Implements toggle voting (vote again to remove), and switching vote type.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    @Transactional
    public VoteResponse vote(VoteRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Vote.VotableType votableType;
        try {
            votableType = Vote.VotableType.valueOf(request.getVotableType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid votable type: " + request.getVotableType());
        }

        Vote.VoteType voteType;
        try {
            voteType = Vote.VoteType.valueOf(request.getVoteType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid vote type: " + request.getVoteType());
        }

        // Verify the target exists
        validateTarget(votableType, request.getVotableId());

        Optional<Vote> existingVote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                userId, votableType, request.getVotableId());

        String message;
        if (existingVote.isPresent()) {
            Vote existing = existingVote.get();
            if (existing.getVoteType() == voteType) {
                // Toggle off: remove vote
                voteRepository.delete(existing);
                updateVoteCounts(votableType, request.getVotableId(), voteType, -1);
                message = "Vote removed";
            } else {
                // Switch vote type
                Vote.VoteType oldType = existing.getVoteType();
                existing.setVoteType(voteType);
                voteRepository.save(existing);
                updateVoteCounts(votableType, request.getVotableId(), oldType, -1);
                updateVoteCounts(votableType, request.getVotableId(), voteType, 1);
                message = "Vote changed to " + voteType.name().toLowerCase();
            }
        } else {
            // New vote
            Vote vote = Vote.builder()
                    .user(user)
                    .votableType(votableType)
                    .votableId(request.getVotableId())
                    .voteType(voteType)
                    .build();
            voteRepository.save(vote);
            updateVoteCounts(votableType, request.getVotableId(), voteType, 1);
            message = voteType.name().toLowerCase() + " recorded";
        }

        // Build response with current counts and user state
        return buildVoteResponse(votableType, request.getVotableId(), userId, message);
    }

    private void validateTarget(Vote.VotableType type, Long id) {
        switch (type) {
            case QUESTION:
                if (!questionRepository.existsById(id)) {
                    throw ApiException.notFound("Question not found: " + id);
                }
                break;
            case ANSWER:
                if (!answerRepository.existsById(id)) {
                    throw ApiException.notFound("Answer not found: " + id);
                }
                break;
        }
    }

    private void updateVoteCounts(Vote.VotableType type, Long id, Vote.VoteType voteType, int delta) {
        switch (type) {
            case QUESTION:
                questionRepository.findById(id).ifPresent(q -> {
                    if (voteType == Vote.VoteType.UPVOTE) {
                        q.setUpvotes(Math.max(0, (q.getUpvotes() != null ? q.getUpvotes() : 0) + delta));
                    } else {
                        q.setDownvoteCount(Math.max(0, (q.getDownvoteCount() != null ? q.getDownvoteCount() : 0) + delta));
                    }
                    questionRepository.save(q);
                });
                break;
            case ANSWER:
                answerRepository.findById(id).ifPresent(a -> {
                    if (voteType == Vote.VoteType.UPVOTE) {
                        a.setUpvoteCount(Math.max(0, (a.getUpvoteCount() != null ? a.getUpvoteCount() : 0) + delta));
                    } else {
                        a.setDownvoteCount(Math.max(0, (a.getDownvoteCount() != null ? a.getDownvoteCount() : 0) + delta));
                    }
                    answerRepository.save(a);
                });
                break;
        }
    }

    private VoteResponse buildVoteResponse(Vote.VotableType votableType, Long votableId,
                                            Long userId, String message) {
        Optional<Vote> userVote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                userId, votableType, votableId);
        boolean hasUpvoted = userVote.map(v -> v.getVoteType() == Vote.VoteType.UPVOTE).orElse(false);
        boolean hasDownvoted = userVote.map(v -> v.getVoteType() == Vote.VoteType.DOWNVOTE).orElse(false);

        int upCount = 0;
        int downCount = 0;
        switch (votableType) {
            case QUESTION:
                Question q = questionRepository.findById(votableId).orElse(null);
                if (q != null) {
                    upCount = q.getUpvotes() != null ? q.getUpvotes() : 0;
                    downCount = q.getDownvoteCount() != null ? q.getDownvoteCount() : 0;
                }
                break;
            case ANSWER:
                Answer a = answerRepository.findById(votableId).orElse(null);
                if (a != null) {
                    upCount = a.getUpvoteCount() != null ? a.getUpvoteCount() : 0;
                    downCount = a.getDownvoteCount() != null ? a.getDownvoteCount() : 0;
                }
                break;
        }

        return VoteResponse.builder()
                .votableType(votableType.name())
                .votableId(votableId)
                .upvoteCount(upCount)
                .downvoteCount(downCount)
                .hasUpvoted(hasUpvoted)
                .hasDownvoted(hasDownvoted)
                .message(message)
                .build();
    }
}
