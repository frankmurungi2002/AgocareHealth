package com.agrocare.service;

import com.agrocare.dto.request.QuestionCreateRequest;
import com.agrocare.dto.request.QuestionUpdateRequest;
import com.agrocare.dto.response.QuestionListResponse;
import com.agrocare.dto.response.QuestionResponse;
import com.agrocare.exception.ApiException;
import com.agrocare.model.nosql.ActivityLog;
import com.agrocare.model.sql.*;
import com.agrocare.model.sql.Question.QuestionStatus;
import com.agrocare.repository.nosql.ActivityLogRepository;
import com.agrocare.repository.sql.*;
import com.agrocare.util.QaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for the dynamic Q&A question system.
 * Replaces the old hardcoded QuestionService with full pagination,
 * category support, vote-aware responses, and activity logging.
 */
@Slf4j
@Service("qaQuestionService")
@RequiredArgsConstructor
public class QaQuestionService {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final VoteRepository voteRepository;
    private final FollowRepository followRepository;
    private final ActivityLogRepository activityLogRepository;
    private final QaMapper mapper;

    // ─── CREATE ───────────────────────────────────────────────────────

    @Transactional
    public QuestionResponse createQuestion(QuestionCreateRequest request, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found with id: " + userId));

        Question question = Question.builder()
                .title(request.getTitle())
                .content(request.getBody())
                .author(author)
                .isAnonymous(request.getIsAnonymous())
                .upvotes(0)
                .downvoteCount(0)
                .answerCount(0)
                .viewCount(0)
                .commentCount(0)
                .medicalAnswerCount(0)
                .isResolved(false)
                .isModerated(true)
                .moderationStatus("APPROVED")
                .status(QuestionStatus.OPEN)
                .build();

        // Set category by ID if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> ApiException.badRequest("Category not found with id: " + request.getCategoryId()));
            question.setCategoryEntity(category);
            // Increment category question count
            category.setQuestionCount(category.getQuestionCount() != null ? category.getQuestionCount() + 1 : 1);
            categoryRepository.save(category);
        }

        Question saved = questionRepository.save(question);
        logActivity(userId, "CREATE_QUESTION", saved.getId(), "QUESTION");
        log.info("User {} created question: {}", userId, saved.getId());

        return mapper.toQuestionResponse(saved);
    }

    // ─── READ (single) ───────────────────────────────────────────────

    @Transactional
    public QuestionResponse getQuestionById(Long id, Long currentUserId) {
        Question question = questionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> ApiException.notFound("Question not found with id: " + id));

        // Increment view count
        question.setViewCount(question.getViewCount() + 1);
        questionRepository.save(question);

        boolean hasUpvoted = false;
        boolean hasDownvoted = false;
        boolean isFollowing = false;

        if (currentUserId != null) {
            Optional<Vote> userVote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                    currentUserId, Vote.VotableType.QUESTION, id);
            hasUpvoted = userVote.map(v -> v.getVoteType() == Vote.VoteType.UPVOTE).orElse(false);
            hasDownvoted = userVote.map(v -> v.getVoteType() == Vote.VoteType.DOWNVOTE).orElse(false);
            isFollowing = followRepository.existsByFollowerIdAndFollowableTypeAndFollowableId(
                    currentUserId, Follow.FollowableType.QUESTION, id);
        }

        return mapper.toQuestionResponse(question, hasUpvoted, hasDownvoted, isFollowing);
    }

    // ─── READ (list / paginated) ──────────────────────────────────────

    public QuestionListResponse getApprovedQuestions(int page, int size, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Question> pageResult = questionRepository.findApprovedWithDetails(pageable);
        return mapper.toQuestionListResponse(pageResult);
    }

    public QuestionListResponse getQuestionsByCategory(String categorySlug, int page, int size, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Question> pageResult = questionRepository.findApprovedByCategorySlugWithDetails(categorySlug, pageable);
        return mapper.toQuestionListResponse(pageResult);
    }

    public QuestionListResponse getQuestionsByAuthor(Long authorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Question> pageResult = questionRepository.findByAuthorId(authorId, pageable);
        return mapper.toQuestionListResponse(pageResult);
    }

    public QuestionListResponse getUnanswered(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Question> pageResult = questionRepository.findUnanswered(pageable);
        return mapper.toQuestionListResponse(pageResult);
    }

    public QuestionListResponse searchQuestions(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Question> pageResult = questionRepository.searchByKeyword(keyword, pageable);
        return mapper.toQuestionListResponse(pageResult);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────

    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionUpdateRequest request, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> ApiException.notFound("Question not found with id: " + questionId));

        // Only the author can update
        if (question.getAuthor() == null || !question.getAuthor().getId().equals(userId)) {
            throw ApiException.forbidden("You can only edit your own questions");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            question.setTitle(request.getTitle());
        }
        if (request.getBody() != null && !request.getBody().isBlank()) {
            question.setContent(request.getBody());
        }
        if (request.getCategoryId() != null) {
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> ApiException.badRequest("Category not found with id: " + request.getCategoryId()));

            // Decrement old category count
            Category oldCategory = question.getCategoryEntity();
            if (oldCategory != null && !oldCategory.getId().equals(newCategory.getId())) {
                oldCategory.setQuestionCount(Math.max(0, oldCategory.getQuestionCount() - 1));
                categoryRepository.save(oldCategory);
                newCategory.setQuestionCount(newCategory.getQuestionCount() + 1);
                categoryRepository.save(newCategory);
            }
            question.setCategoryEntity(newCategory);
        }

        Question saved = questionRepository.save(question);
        logActivity(userId, "UPDATE_QUESTION", saved.getId(), "QUESTION");
        return mapper.toQuestionResponse(saved);
    }

    // ─── DELETE ───────────────────────────────────────────────────────

    @Transactional
    public void deleteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> ApiException.notFound("Question not found with id: " + questionId));

        // Only author or admin can delete
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        boolean isOwner = question.getAuthor() != null && question.getAuthor().getId().equals(userId);
        boolean isAdmin = requester.getRole() == User.UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("You can only delete your own questions");
        }

        // Decrement category count
        if (question.getCategoryEntity() != null) {
            Category cat = question.getCategoryEntity();
            cat.setQuestionCount(Math.max(0, cat.getQuestionCount() - 1));
            categoryRepository.save(cat);
        }

        questionRepository.delete(question);
        logActivity(userId, "DELETE_QUESTION", questionId, "QUESTION");
        log.info("User {} deleted question {}", userId, questionId);
    }

    // ─── STATUS ───────────────────────────────────────────────────────

    @Transactional
    public QuestionResponse markAsResolved(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> ApiException.notFound("Question not found"));
        if (question.getAuthor() == null || !question.getAuthor().getId().equals(userId)) {
            throw ApiException.forbidden("Only the author can mark a question as resolved");
        }
        question.setIsResolved(true);
        question.setStatus(QuestionStatus.ANSWERED);
        Question saved = questionRepository.save(question);
        return mapper.toQuestionResponse(saved);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────

    private Pageable buildPageable(int page, int size, String sortBy) {
        Sort sort;
        switch (sortBy != null ? sortBy.toLowerCase() : "newest") {
            case "popular":
                sort = Sort.by(Sort.Direction.DESC, "upvotes");
                break;
            case "unanswered":
                sort = Sort.by(Sort.Direction.ASC, "answerCount").and(Sort.by(Sort.Direction.DESC, "createdAt"));
                break;
            case "most-answers":
                sort = Sort.by(Sort.Direction.DESC, "answerCount");
                break;
            case "oldest":
                sort = Sort.by(Sort.Direction.ASC, "createdAt");
                break;
            case "newest":
            default:
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }
        return PageRequest.of(page, size, sort);
    }

    private void logActivity(Long userId, String actionType, Long targetId, String targetType) {
        try {
            ActivityLog log = ActivityLog.builder()
                    .userId(userId)
                    .actionType(actionType)
                    .targetId(targetId)
                    .targetType(targetType)
                    .timestamp(LocalDateTime.now())
                    .isSuccessful(true)
                    .status("NEW")
                    .build();
            activityLogRepository.save(log);
        } catch (Exception e) {
            QaQuestionService.log.warn("Failed to log activity: {}", e.getMessage());
        }
    }
}
