package com.agrocare.service;

import com.agrocare.dto.request.CommentCreateRequest;
import com.agrocare.dto.response.CommentResponse;
import com.agrocare.exception.ApiException;
import com.agrocare.model.nosql.QaComment;
import com.agrocare.model.sql.User;
import com.agrocare.repository.nosql.QaCommentRepository;
import com.agrocare.repository.sql.UserRepository;
import com.agrocare.repository.sql.QuestionRepository;
import com.agrocare.repository.sql.AnswerRepository;
import com.agrocare.util.QaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for comments stored in MongoDB (qa_comments collection).
 * Supports nested replies via parentCommentId.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final QaCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QaMapper mapper;

    public CommentResponse createComment(CommentCreateRequest request, String commentableType,
                                          String commentableId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        // Validate parent entity exists
        validateCommentTarget(commentableType, commentableId);

        // Validate parent comment exists if replying
        if (request.getParentCommentId() != null && !request.getParentCommentId().isBlank()) {
            if (!commentRepository.existsById(request.getParentCommentId())) {
                throw ApiException.notFound("Parent comment not found");
            }
        }

        QaComment comment = QaComment.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .userType(user.getUserType() != null ? user.getUserType().name() : "PATIENT")
                .profilePicture(user.getProfilePicture())
                .commentableType(commentableType.toUpperCase())
                .commentableId(Long.parseLong(commentableId))
                .content(request.getContent())
                .parentCommentId(request.getParentCommentId())
                .likes(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        QaComment saved = commentRepository.save(comment);

        // Increment comment count on parent entity
        incrementCommentCount(commentableType, commentableId);

        log.info("User {} commented on {} {}", userId, commentableType, commentableId);
        return mapper.toCommentResponse(saved);
    }

    /**
     * Get all comments for a target entity, organized as a tree (replies nested under parents).
     */
    public List<CommentResponse> getComments(String commentableType, String commentableId) {
        List<QaComment> allComments = commentRepository.findByCommentableTypeAndCommentableIdOrderByCreatedAtAsc(
                commentableType.toUpperCase(), Long.parseLong(commentableId));

        // Convert to responses
        List<CommentResponse> responses = allComments.stream()
                .map(mapper::toCommentResponse)
                .collect(Collectors.toList());

        // Build tree: separate top-level and replies
        Map<String, CommentResponse> commentMap = new LinkedHashMap<>();
        List<CommentResponse> topLevel = new ArrayList<>();

        for (CommentResponse resp : responses) {
            commentMap.put(resp.getId(), resp);
        }
        for (CommentResponse resp : responses) {
            if (resp.getParentCommentId() != null && commentMap.containsKey(resp.getParentCommentId())) {
                CommentResponse parent = commentMap.get(resp.getParentCommentId());
                if (parent.getReplies() == null) {
                    parent.setReplies(new ArrayList<>());
                }
                parent.getReplies().add(resp);
            } else {
                topLevel.add(resp);
            }
        }

        return topLevel;
    }

    public CommentResponse likeComment(String commentId, Long userId) {
        QaComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment not found"));
        comment.setLikes(comment.getLikes() != null ? comment.getLikes() + 1 : 1);
        QaComment saved = commentRepository.save(comment);
        return mapper.toCommentResponse(saved);
    }

    public void deleteComment(String commentId, Long userId) {
        QaComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ApiException.notFound("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            // Check if admin
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("User not found"));
            if (user.getRole() != User.UserRole.ADMIN) {
                throw ApiException.forbidden("You can only delete your own comments");
            }
        }

        // Delete replies too
        List<QaComment> replies = commentRepository.findByParentCommentId(commentId);
        commentRepository.deleteAll(replies);
        commentRepository.delete(comment);

        log.info("User {} deleted comment {}", userId, commentId);
    }

    private void validateCommentTarget(String commentableType, String commentableId) {
        switch (commentableType.toUpperCase()) {
            case "QUESTION":
                if (!questionRepository.existsById(Long.parseLong(commentableId))) {
                    throw ApiException.notFound("Question not found: " + commentableId);
                }
                break;
            case "ANSWER":
                if (!answerRepository.existsById(Long.parseLong(commentableId))) {
                    throw ApiException.notFound("Answer not found: " + commentableId);
                }
                break;
            default:
                throw ApiException.badRequest("Invalid commentable type: " + commentableType);
        }
    }

    private void incrementCommentCount(String commentableType, String commentableId) {
        try {
            switch (commentableType.toUpperCase()) {
                case "QUESTION":
                    questionRepository.findById(Long.parseLong(commentableId)).ifPresent(q -> {
                        q.setCommentCount((q.getCommentCount() != null ? q.getCommentCount() : 0) + 1);
                        questionRepository.save(q);
                    });
                    break;
                case "ANSWER":
                    answerRepository.findById(Long.parseLong(commentableId)).ifPresent(a -> {
                        a.setCommentCount((a.getCommentCount() != null ? a.getCommentCount() : 0) + 1);
                        answerRepository.save(a);
                    });
                    break;
            }
        } catch (NumberFormatException e) {
            log.warn("Could not parse commentableId: {}", commentableId);
        }
    }
}
