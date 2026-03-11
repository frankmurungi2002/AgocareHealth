package com.agrocare.controller;

import com.agrocare.dto.ApiResponse;
import com.agrocare.dto.request.QuestionCreateRequest;
import com.agrocare.dto.request.QuestionUpdateRequest;
import com.agrocare.dto.response.QuestionListResponse;
import com.agrocare.dto.response.QuestionResponse;
import com.agrocare.model.sql.User;
import com.agrocare.service.QaQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the dynamic Q&A question system.
 * Mapped under /qa/questions to avoid conflicts with the legacy /questions endpoints.
 */
@RestController
@RequestMapping("/qa/questions")
@RequiredArgsConstructor
public class QaQuestionController {

    private final QaQuestionService qaQuestionService;

    /**
     * Create a new question (requires authentication).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        QuestionResponse response = qaQuestionService.createQuestion(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", response));
    }

    /**
     * Get a single question by ID (public).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        QuestionResponse response = qaQuestionService.getQuestionById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * List approved questions with pagination and sorting (public).
     * Supports: ?page=0&size=10&sort=newest|popular|unanswered|most-answers|oldest
     */
    @GetMapping
    public ResponseEntity<ApiResponse<QuestionListResponse>> listQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort) {

        QuestionListResponse response = qaQuestionService.getApprovedQuestions(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * List questions by category slug (public).
     */
    @GetMapping("/category/{categorySlug}")
    public ResponseEntity<ApiResponse<QuestionListResponse>> listByCategory(
            @PathVariable String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort) {

        QuestionListResponse response = qaQuestionService.getQuestionsByCategory(categorySlug, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * List questions by author ID (public).
     */
    @GetMapping("/user/{authorId}")
    public ResponseEntity<ApiResponse<QuestionListResponse>> listByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        QuestionListResponse response = qaQuestionService.getQuestionsByAuthor(authorId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * List unanswered questions (public).
     */
    @GetMapping("/unanswered")
    public ResponseEntity<ApiResponse<QuestionListResponse>> listUnanswered(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        QuestionListResponse response = qaQuestionService.getUnanswered(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Search questions by keyword (public).
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<QuestionListResponse>> searchQuestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        QuestionListResponse response = qaQuestionService.searchQuestions(q, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update a question (requires authentication, author only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {

        QuestionResponse response = qaQuestionService.updateQuestion(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Question updated", response));
    }

    /**
     * Delete a question (requires authentication, author or admin).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        qaQuestionService.deleteQuestion(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Question deleted", null));
    }

    /**
     * Mark question as resolved (requires authentication, author only).
     */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<QuestionResponse>> markResolved(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        QuestionResponse response = qaQuestionService.markAsResolved(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Question marked as resolved", response));
    }
}
