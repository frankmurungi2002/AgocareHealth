package com.agrocare.controller;

import com.agrocare.dto.ApiResponse;
import com.agrocare.dto.request.CommentCreateRequest;
import com.agrocare.dto.response.CommentResponse;
import com.agrocare.model.sql.User;
import com.agrocare.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for comments on questions and answers.
 * Comments are stored in MongoDB (qa_comments collection).
 */
@RestController
@RequestMapping("/qa/comments")
@RequiredArgsConstructor
public class QaCommentController {

    private final CommentService commentService;

    /**
     * Create a comment on a question or answer.
     * POST /qa/comments/{commentableType}/{commentableId}
     * commentableType: QUESTION or ANSWER
     */
    @PostMapping("/{commentableType}/{commentableId}")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable String commentableType,
            @PathVariable String commentableId,
            @Valid @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        CommentResponse response = commentService.createComment(
                request, commentableType, commentableId, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment posted", response));
    }

    /**
     * Get all comments for a target entity (threaded tree).
     * GET /qa/comments/{commentableType}/{commentableId}
     */
    @GetMapping("/{commentableType}/{commentableId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable String commentableType,
            @PathVariable String commentableId) {

        List<CommentResponse> responses = commentService.getComments(commentableType, commentableId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Like a comment.
     */
    @PostMapping("/{commentId}/like")
    public ResponseEntity<ApiResponse<CommentResponse>> likeComment(
            @PathVariable String commentId,
            @AuthenticationPrincipal User currentUser) {

        CommentResponse response = commentService.likeComment(commentId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment liked", response));
    }

    /**
     * Delete a comment (owner or admin).
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable String commentId,
            @AuthenticationPrincipal User currentUser) {

        commentService.deleteComment(commentId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}
