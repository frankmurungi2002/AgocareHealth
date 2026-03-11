package com.agrocare.controller;

import com.agrocare.dto.ApiResponse;
import com.agrocare.dto.request.AnswerCreateRequest;
import com.agrocare.dto.response.AnswerResponse;
import com.agrocare.model.sql.User;
import com.agrocare.service.QaAnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the dynamic Q&A answer system (SQL-based).
 * Mapped under /qa/questions/{questionId}/answers.
 */
@RestController
@RequestMapping("/qa/questions/{questionId}/answers")
@RequiredArgsConstructor
public class QaAnswerController {

    private final QaAnswerService qaAnswerService;

    @PostMapping
    public ResponseEntity<ApiResponse<AnswerResponse>> createAnswer(
            @PathVariable Long questionId,
            @Valid @RequestBody AnswerCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        AnswerResponse response = qaAnswerService.createAnswer(questionId, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Answer posted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnswerResponse>>> getAnswers(
            @PathVariable Long questionId,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : null;
        List<AnswerResponse> responses = qaAnswerService.getAnswersForQuestion(questionId, userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PatchMapping("/{answerId}/accept")
    public ResponseEntity<ApiResponse<AnswerResponse>> acceptAnswer(
            @PathVariable Long questionId,
            @PathVariable Long answerId,
            @AuthenticationPrincipal User currentUser) {

        AnswerResponse response = qaAnswerService.acceptAnswer(answerId, questionId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Answer accepted", response));
    }

    @PutMapping("/{answerId}")
    public ResponseEntity<ApiResponse<AnswerResponse>> updateAnswer(
            @PathVariable Long questionId,
            @PathVariable Long answerId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {

        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Content is required", "VALIDATION_ERROR"));
        }
        AnswerResponse response = qaAnswerService.updateAnswer(answerId, content, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Answer updated", response));
    }

    @DeleteMapping("/{answerId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnswer(
            @PathVariable Long questionId,
            @PathVariable Long answerId,
            @AuthenticationPrincipal User currentUser) {

        qaAnswerService.deleteAnswer(answerId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Answer deleted", null));
    }
}
