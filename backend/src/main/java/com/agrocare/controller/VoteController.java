package com.agrocare.controller;

import com.agrocare.dto.ApiResponse;
import com.agrocare.dto.request.VoteRequest;
import com.agrocare.dto.response.VoteResponse;
import com.agrocare.model.sql.User;
import com.agrocare.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for voting on questions and answers.
 */
@RestController
@RequestMapping("/qa/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    public ResponseEntity<ApiResponse<VoteResponse>> vote(
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal User currentUser) {

        VoteResponse response = voteService.vote(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }
}
