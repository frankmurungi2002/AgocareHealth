package com.agrocare.service;

import com.agrocare.dto.response.FollowResponse;
import com.agrocare.exception.ApiException;
import com.agrocare.model.sql.Follow;
import com.agrocare.model.sql.User;
import com.agrocare.repository.sql.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for following/unfollowing questions, users, and categories.
 * Toggle pattern: follow again to unfollow.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public FollowResponse toggleFollow(String followableType, Long followableId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Follow.FollowableType type;
        try {
            type = Follow.FollowableType.valueOf(followableType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid followable type: " + followableType);
        }

        // Verify target exists
        validateTarget(type, followableId);

        Optional<Follow> existing = followRepository.findByFollowerIdAndFollowableTypeAndFollowableId(
                userId, type, followableId);

        boolean isFollowing;
        String message;
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            isFollowing = false;
            message = "Unfollowed successfully";
        } else {
            Follow follow = Follow.builder()
                    .follower(user)
                    .followableType(type)
                    .followableId(followableId)
                    .build();
            followRepository.save(follow);
            isFollowing = true;
            message = "Following successfully";
        }

        int followerCount = (int) followRepository.countByFollowableTypeAndFollowableId(type, followableId);

        return FollowResponse.builder()
                .followableType(type.name())
                .followableId(followableId)
                .isFollowing(isFollowing)
                .followerCount(followerCount)
                .message(message)
                .build();
    }

    public boolean isFollowing(Long userId, String followableType, Long followableId) {
        try {
            Follow.FollowableType type = Follow.FollowableType.valueOf(followableType.toUpperCase());
            return followRepository.existsByFollowerIdAndFollowableTypeAndFollowableId(userId, type, followableId);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private void validateTarget(Follow.FollowableType type, Long id) {
        switch (type) {
            case QUESTION:
                if (!questionRepository.existsById(id)) {
                    throw ApiException.notFound("Question not found: " + id);
                }
                break;
            case USER:
                if (!userRepository.existsById(id)) {
                    throw ApiException.notFound("User not found: " + id);
                }
                break;
            case CATEGORY:
                if (!categoryRepository.existsById(id)) {
                    throw ApiException.notFound("Category not found: " + id);
                }
                break;
        }
    }
}
