package com.agrocare.service;

import com.agrocare.dto.AnswerDTO;
import com.agrocare.dto.CommentDTO;
import com.agrocare.model.nosql.Answer;
import com.agrocare.model.nosql.Comment;
import com.agrocare.model.sql.Question;
import com.agrocare.model.sql.User;
import com.agrocare.repository.nosql.LegacyAnswerRepository;
import com.agrocare.repository.sql.QuestionRepository;
import com.agrocare.repository.sql.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnswerService {

    @Autowired
    private LegacyAnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new answer to a question
     */
    public Answer createAnswer(Long questionId, Long userId, String content) {
        // Verify question exists
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Answer answer = Answer.builder()
                .questionId(questionId)
                .authorId(userId)
                .authorName(user.getName())
                .authorRole(user.getRole().name())
                .content(content)
                .upvotes(0)
                .downvotes(0)
                .isAccepted(false)
                .isModerated(true)
                .moderationStatus("APPROVED")
                .helpfulCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Answer savedAnswer = answerRepository.save(answer);

        // Increment answer count in question
        question.setAnswerCount(question.getAnswerCount() + 1);
        questionRepository.save(question);

        return savedAnswer;
    }

    /**
     * Get answer by ID
     */
    public AnswerDTO getAnswerById(String id) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        return convertToDTO(answer);
    }

    /**
     * Get all answers for a question (sorted by helpful count)
     */
    public List<AnswerDTO> getAnswersForQuestion(Long questionId) {
        return answerRepository.findByQuestionIdOrderByHelpfulCountDesc(questionId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get answers by author
     */
    public List<AnswerDTO> getAnswersByAuthor(Long userId) {
        return answerRepository.findByAuthorId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Upvote an answer
     */
    public void upvoteAnswer(String answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        answer.setUpvotes(answer.getUpvotes() + 1);
        answerRepository.save(answer);
    }

    /**
     * Downvote an answer
     */
    public void downvoteAnswer(String answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        answer.setDownvotes(answer.getDownvotes() + 1);
        answerRepository.save(answer);
    }

    /**
     * Mark answer as helpful
     */
    public void markAsHelpful(String answerId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        answer.setHelpfulCount(answer.getHelpfulCount() + 1);
        answerRepository.save(answer);
    }

    /**
     * Accept answer for a question
     */
    public void acceptAnswer(String answerId, Long questionId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        answer.setIsAccepted(true);
        answerRepository.save(answer);
    }

    /**
     * Add a comment to an answer
     */
    public Answer addComment(String answerId, Long userId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        Comment comment = Comment.builder()
                .answerId(answerId) // Use String answerId directly
                .authorId(userId)
                .authorName(user.getName())
                .authorRole(user.getRole().name())
                .content(content)
                .upvotes(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isEdited(false)
                .build();

        if (answer.getComments() == null) {
            answer.setComments(new java.util.ArrayList<>());
        }
        answer.getComments().add(comment);
        return answerRepository.save(answer);
    }

    /**
     * Add reply to a comment (nested comment)
     */
    public Answer addReplyToComment(String answerId, String parentCommentId, Long userId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        Comment reply = Comment.builder()
                .answerId(answerId)
                .authorId(userId)
                .authorName(user.getName())
                .authorRole(user.getRole().name())
                .content(content)
                .upvotes(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isEdited(false)
                .build();

        // Find parent comment and add reply
        if (answer.getComments() != null) {
            for (Comment comment : answer.getComments()) {
                if (comment.getId().equals(parentCommentId)) {
                    if (comment.getReplies() == null) {
                        comment.setReplies(new java.util.ArrayList<>());
                    }
                    comment.getReplies().add(reply);
                    break;
                }
            }
        }

        return answerRepository.save(answer);
    }

    /**
     * Rate comment as helpful
     */
    public Answer rateCommentHelpful(String answerId, String commentId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        if (answer.getComments() != null) {
            for (Comment comment : answer.getComments()) {
                if (comment.getId().equals(commentId)) {
                    comment.setUpvotes(comment.getUpvotes() + 1);
                    break;
                }
                // Check nested replies
                if (comment.getReplies() != null) {
                    for (Comment reply : comment.getReplies()) {
                        if (reply.getId().equals(commentId)) {
                            reply.setUpvotes(reply.getUpvotes() + 1);
                            break;
                        }
                    }
                }
            }
        }

        return answerRepository.save(answer);
    }

    /**
     * Update answer
     */
    public Answer updateAnswer(String answerId, String content) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        answer.setContent(content);
        answer.setUpdatedAt(LocalDateTime.now());
        return answerRepository.save(answer);
    }

    /**
     * Delete answer
     */
    public void deleteAnswer(String answerId, Long questionId) {
        answerRepository.deleteById(answerId);

        // Decrement answer count in question
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setAnswerCount(Math.max(0, question.getAnswerCount() - 1));
        questionRepository.save(question);
    }

    /**
     * Convert Answer entity to AnswerDTO (including comments)
     */
    private AnswerDTO convertToDTO(Answer answer) {
        List<CommentDTO> commentDTOs = answer.getComments() != null 
            ? answer.getComments().stream()
                .map(c -> convertCommentToDTO(c))
                .collect(Collectors.toList())
            : new java.util.ArrayList<>();
        
        return AnswerDTO.builder()
                .id(answer.getId())
                .questionId(answer.getQuestionId())
                .authorId(answer.getAuthorId())
                .authorName(answer.getAuthorName())
                .authorRole(answer.getAuthorRole())
                .content(answer.getContent())
                .upvotes(answer.getUpvotes())
                .downvotes(answer.getDownvotes())
                .isAccepted(answer.getIsAccepted())
                .isModerated(answer.getIsModerated())
                .moderationStatus(answer.getModerationStatus())
                .helpfulCount(answer.getHelpfulCount())
                .createdAt(answer.getCreatedAt().toString())
                .updatedAt(answer.getUpdatedAt().toString())
                .comments(commentDTOs)
                .build();
    }
    
    /**
     * Convert Comment to CommentDTO
     */
    private CommentDTO convertCommentToDTO(Comment comment) {
        List<CommentDTO> replyDTOs = comment.getReplies() != null
            ? comment.getReplies().stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList())
            : new java.util.ArrayList<>();
        
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setAnswerId(comment.getAnswerId());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorRole(comment.getAuthorRole());
        dto.setContent(comment.getContent());
        dto.setUpvotes(comment.getUpvotes());
        dto.setCreatedAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : "");
        dto.setReplies(replyDTOs);
        return dto;
    }
}
