package com.agrocare.util;

import com.agrocare.dto.response.*;
import com.agrocare.model.nosql.Notification;
import com.agrocare.model.nosql.QaComment;
import com.agrocare.model.sql.*;
import com.agrocare.model.sql.Question.QuestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class to map entities to response DTOs.
 */
@Component
public class QaMapper {

    // ─── Question ─────────────────────────────────────────────────────

    public QuestionResponse toQuestionResponse(Question question, boolean hasUpvoted,
                                                boolean hasDownvoted, boolean isFollowing) {
        return QuestionResponse.builder()
                .id(question.getId())
                .title(question.getTitle())
                .body(question.getContent())
                .category(mapCategory(question))
                .author(mapQuestionAuthor(question))
                .stats(mapQuestionStats(question))
                .userInteractions(QuestionResponse.UserInteractionDTO.builder()
                        .hasUpvoted(hasUpvoted)
                        .hasDownvoted(hasDownvoted)
                        .isFollowing(isFollowing)
                        .build())
                .status(question.getStatus() != null ? question.getStatus().name() : QuestionStatus.OPEN.name())
                .isAnonymous(question.getIsAnonymous() != null && question.getIsAnonymous())
                .relativeTime(getRelativeTime(question.getCreatedAt()))
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    public QuestionResponse toQuestionResponse(Question question) {
        return toQuestionResponse(question, false, false, false);
    }

    public QuestionListResponse toQuestionListResponse(Page<Question> page) {
        List<QuestionResponse> items = page.getContent().stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());

        return QuestionListResponse.builder()
                .questions(items)
                .pagination(QuestionListResponse.PaginationDTO.builder()
                        .currentPage(page.getNumber())
                        .totalPages(page.getTotalPages())
                        .totalQuestions(page.getTotalElements())
                        .perPage(page.getSize())
                        .hasNext(page.hasNext())
                        .hasPrevious(page.hasPrevious())
                        .build())
                .build();
    }

    private QuestionResponse.AuthorDTO mapQuestionAuthor(Question question) {
        User author = question.getAuthor();
        if (author == null || (question.getIsAnonymous() != null && question.getIsAnonymous())) {
            return QuestionResponse.AuthorDTO.builder()
                    .username("anonymous")
                    .name("Anonymous")
                    .initials("A")
                    .build();
        }
        return QuestionResponse.AuthorDTO.builder()
                .id(author.getId())
                .username(author.getUsername())
                .name(author.getName())
                .initials(getInitials(author.getName()))
                .profilePicture(author.getProfilePicture())
                .verificationBadge(author.getVerificationBadge() != null && author.getVerificationBadge())
                .userType(author.getUserType() != null ? author.getUserType().name() : "PATIENT")
                .build();
    }

    private QuestionResponse.CategoryDTO mapCategory(Question question) {
        Category cat = question.getCategoryEntity();
        if (cat != null) {
            return QuestionResponse.CategoryDTO.builder()
                    .id(cat.getId())
                    .name(cat.getName())
                    .slug(cat.getSlug())
                    .icon(cat.getIcon())
                    .colorCode(cat.getColorCode())
                    .build();
        }
        // Fallback to enum-based category
        if (question.getCategory() != null) {
            return QuestionResponse.CategoryDTO.builder()
                    .name(question.getCategory().name())
                    .slug(question.getCategory().name().toLowerCase().replace("_", "-"))
                    .build();
        }
        return null;
    }

    private QuestionResponse.StatsDTO mapQuestionStats(Question question) {
        return QuestionResponse.StatsDTO.builder()
                .views(question.getViewCount() != null ? question.getViewCount() : 0)
                .upvotes(question.getUpvotes() != null ? question.getUpvotes() : 0)
                .downvotes(question.getDownvoteCount() != null ? question.getDownvoteCount() : 0)
                .answers(question.getAnswerCount() != null ? question.getAnswerCount() : 0)
                .medicalAnswers(question.getMedicalAnswerCount() != null ? question.getMedicalAnswerCount() : 0)
                .comments(question.getCommentCount() != null ? question.getCommentCount() : 0)
                .build();
    }

    // ─── Answer ───────────────────────────────────────────────────────

    public AnswerResponse toAnswerResponse(com.agrocare.model.sql.Answer answer,
                                            boolean hasUpvoted, boolean hasDownvoted) {
        User author = answer.getAuthor();
        AnswerResponse.AuthorDTO authorDTO = (author != null) ?
                AnswerResponse.AuthorDTO.builder()
                        .id(author.getId())
                        .username(author.getUsername())
                        .name(author.getName())
                        .initials(getInitials(author.getName()))
                        .profilePicture(author.getProfilePicture())
                        .verificationBadge(author.getVerificationBadge() != null && author.getVerificationBadge())
                        .userType(author.getUserType() != null ? author.getUserType().name() : "PATIENT")
                        .build()
                : AnswerResponse.AuthorDTO.builder()
                        .username("anonymous")
                        .name("Anonymous")
                        .initials("A")
                        .build();

        return AnswerResponse.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null)
                .content(answer.getContent())
                .isAccepted(answer.getIsAccepted() != null && answer.getIsAccepted())
                .author(authorDTO)
                .stats(AnswerResponse.StatsDTO.builder()
                        .upvotes(answer.getUpvoteCount() != null ? answer.getUpvoteCount() : 0)
                        .downvotes(answer.getDownvoteCount() != null ? answer.getDownvoteCount() : 0)
                        .comments(answer.getCommentCount() != null ? answer.getCommentCount() : 0)
                        .build())
                .userInteraction(AnswerResponse.UserInteractionDTO.builder()
                        .hasUpvoted(hasUpvoted)
                        .hasDownvoted(hasDownvoted)
                        .build())
                .timeAgo(getRelativeTime(answer.getCreatedAt()))
                .createdAt(answer.getCreatedAt())
                .updatedAt(answer.getUpdatedAt())
                .build();
    }

    public AnswerResponse toAnswerResponse(com.agrocare.model.sql.Answer answer) {
        return toAnswerResponse(answer, false, false);
    }

    // ─── Category ─────────────────────────────────────────────────────

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .icon(category.getIcon())
                .colorCode(category.getColorCode())
                .description(category.getDescription())
                .questionCount(category.getQuestionCount() != null ? category.getQuestionCount() : 0)
                .createdAt(category.getCreatedAt())
                .build();
    }

    // ─── Comment (Mongo) ──────────────────────────────────────────────

    public CommentResponse toCommentResponse(QaComment comment) {
        CommentResponse.AuthorDTO authorDTO = CommentResponse.AuthorDTO.builder()
                .userId(comment.getUserId())
                .username(comment.getUsername())
                .userType(comment.getUserType())
                .profilePicture(comment.getProfilePicture())
                .initials(comment.getUsername() != null ? getInitials(comment.getUsername()) : "?")
                .build();

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .commentableType(comment.getCommentableType())
                .commentableId(String.valueOf(comment.getCommentableId()))
                .author(authorDTO)
                .likes(comment.getLikes() != null ? comment.getLikes() : 0)
                .parentCommentId(comment.getParentCommentId())
                .replies(new ArrayList<>())
                .timeAgo(getRelativeTime(comment.getCreatedAt()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    // ─── Notification (Mongo) ─────────────────────────────────────────

    public NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .referenceType(notification.getReferenceType())
                .referenceId(String.valueOf(notification.getReferenceId()))
                .actorName(notification.getActorName())
                .message(notification.getMessage())
                .isRead(notification.getIsRead() != null && notification.getIsRead())
                .timeAgo(getRelativeTime(notification.getCreatedAt()))
                .createdAt(notification.getCreatedAt())
                .build();
    }

    // ─── Utilities ────────────────────────────────────────────────────

    /**
     * Get human-readable relative time string (e.g. "2 hours ago", "3 days ago").
     */
    public static String getRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 60) return "just now";
        if (seconds < 3600) return (seconds / 60) + " min ago";
        if (seconds < 86400) return (seconds / 3600) + " hours ago";
        if (seconds < 604800) return (seconds / 86400) + " days ago";
        if (seconds < 2592000) return (seconds / 604800) + " weeks ago";
        if (seconds < 31536000) return (seconds / 2592000) + " months ago";
        return (seconds / 31536000) + " years ago";
    }

    /**
     * Get user initials from full name (e.g. "Murungi Francis" → "MF").
     */
    public static String getInitials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
