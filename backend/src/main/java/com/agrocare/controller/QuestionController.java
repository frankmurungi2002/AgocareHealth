package com.agrocare.controller;

import com.agrocare.dto.QuestionDTO;
import com.agrocare.model.sql.Question;
import com.agrocare.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    /**
     * Create a new question
     * POST /api/questions/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createQuestion(@RequestParam(required = false) Long userId,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam String category) {
        try {
            Question question = questionService.createQuestion(userId, title, content, category);
            QuestionDTO questionDTO = convertToDTO(question);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Question created successfully");
            response.put("question", questionDTO);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all questions
     * GET /api/questions
     */
    @GetMapping
    public ResponseEntity<?> getAllQuestions() {
        try {
            List<QuestionDTO> questions = questionService.getAllQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get approved questions (for public display)
     * GET /api/questions/approved
     */
    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedQuestions() {
        try {
            List<QuestionDTO> questions = questionService.getApprovedQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get question by ID
     * GET /api/questions/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestion(@PathVariable Long id) {
        try {
            QuestionDTO question = questionService.getQuestionById(id);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get questions by category
     * GET /api/questions/category/:category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getQuestionsByCategory(@PathVariable String category) {
        try {
            List<QuestionDTO> questions = questionService.getQuestionsByCategory(category);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get unresolved questions
     * GET /api/questions/unresolved
     */
    @GetMapping("/unresolved")
    public ResponseEntity<?> getUnresolvedQuestions() {
        try {
            List<QuestionDTO> questions = questionService.getUnresolvedQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Search questions
     * GET /api/questions/search?keyword=...
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchQuestions(@RequestParam String keyword) {
        try {
            List<QuestionDTO> questions = questionService.searchQuestions(keyword);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Toggle upvote on a question
     * POST /api/questions/:id/upvote
     */
    @PostMapping("/{id}/upvote")
    public ResponseEntity<?> upvoteQuestion(@PathVariable Long id,
            @RequestParam Long userId) {
        try {
            Map<String, Object> result = questionService.upvoteQuestion(id, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Toggle downvote on a question
     * POST /api/questions/:id/downvote
     */
    @PostMapping("/{id}/downvote")
    public ResponseEntity<?> downvoteQuestion(@PathVariable Long id,
            @RequestParam Long userId) {
        try {
            Map<String, Object> result = questionService.downvoteQuestion(id, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user's vote status on a question
     * GET /api/questions/:id/vote-status?userId=...
     */
    @GetMapping("/{id}/vote-status")
    public ResponseEntity<?> getVoteStatus(@PathVariable Long id,
            @RequestParam Long userId) {
        try {
            String status = questionService.getUserVoteStatus(id, userId);
            Map<String, String> response = new HashMap<>();
            response.put("userVote", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update question
     * PUT /api/questions/:id
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String category) {
        try {
            Question question = questionService.updateQuestion(id, title, content, category);
            QuestionDTO questionDTO = convertToDTO(question);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Question updated successfully");
            response.put("question", questionDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete question
     * DELETE /api/questions/:id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Question deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Mark question as resolved
     * POST /api/questions/:id/resolve
     */
    @PostMapping("/{id}/resolve")
    public ResponseEntity<?> markAsResolved(@PathVariable Long id) {
        try {
            questionService.markAsResolved(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Question marked as resolved");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Convert Question to QuestionDTO
     */
    private QuestionDTO convertToDTO(Question question) {
        Long authorId = question.getAuthor() != null ? question.getAuthor().getId() : null;
        String authorName = question.getAuthor() != null ? question.getAuthor().getName() : "Anonymous";
        
        return QuestionDTO.builder()
                .id(question.getId())
                .title(question.getTitle())
                .content(question.getContent())
                .authorId(authorId)
                .authorName(authorName)
                .category(question.getCategory() != null ? question.getCategory().name() : "GENERAL")
                .upvotes(question.getUpvotes())
                .answerCount(question.getAnswerCount())
                .viewCount(question.getViewCount())
                .isResolved(question.getIsResolved())
                .isModerated(question.getIsModerated())
                .moderationStatus(question.getModerationStatus())
                .createdAt(question.getCreatedAt().toString())
                .updatedAt(question.getUpdatedAt().toString())
                .build();
    }
}
