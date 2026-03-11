package com.agrocare.controller;

import com.agrocare.dto.ApiResponse;
import com.agrocare.dto.response.FollowResponse;
import com.agrocare.model.sql.User;
import com.agrocare.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for following/unfollowing questions, users, and categories.
 */
@RestController
@RequestMapping("/qa/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /**
     * Toggle follow on a target (follow/unfollow).
     * Request: POST /qa/follow/{type}/{id}
     * Types: QUESTION, USER, CATEGORY
     */
    @PostMapping("/{followableType}/{followableId}")
    public ResponseEntity<ApiResponse<FollowResponse>> toggleFollow(
            @PathVariable String followableType,
            @PathVariable Long followableId,
            @AuthenticationPrincipal User currentUser) {

        FollowResponse response = followService.toggleFollow(followableType, followableId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Check if user is following a target.
     */
    @GetMapping("/{followableType}/{followableId}")
    public ResponseEntity<ApiResponse<Boolean>> checkFollow(
            @PathVariable String followableType,
            @PathVariable Long followableId,
            @AuthenticationPrincipal User currentUser) {

        boolean isFollowing = followService.isFollowing(currentUser.getId(), followableType, followableId);
        return ResponseEntity.ok(ApiResponse.success(isFollowing));
    }
}
