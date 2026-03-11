package com.agrocare.service;

import com.agrocare.dto.QuestionDTO;
import com.agrocare.model.sql.Question;
import com.agrocare.model.sql.User;
import com.agrocare.model.sql.Vote;
import com.agrocare.repository.sql.QuestionRepository;
import com.agrocare.repository.sql.UserRepository;
import com.agrocare.repository.sql.VoteRepository;
import com.agrocare.model.nosql.ActivityLog;
import com.agrocare.repository.nosql.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private VoteRepository voteRepository;

    /**
     * Create a new question
     */
    public Question createQuestion(Long userId, String title, String content, String category) {
        User author = null;
        
        // If userId is provided, get the user; otherwise use null for anonymous
        if (userId != null) {
            author = userRepository.findById(userId).orElse(null);
        }
        
        // If no author found (anonymous or user not found), that's okay
        Question question = Question.builder()
                .title(title)
                .content(content)
                .author(author)
                .category(Question.QuestionCategory.valueOf(category.toUpperCase()))
                .upvotes(0)
                .answerCount(0)
                .viewCount(0)
                .isResolved(false)
                .isModerated(true)
                .moderationStatus("APPROVED")
                .build();

        Question savedQuestion = questionRepository.save(question);

        // Log activity only if user is logged in
        if (userId != null) {
            logActivity(userId, "CREATE_QUESTION", savedQuestion.getId(), "QUESTION");
        }

        return savedQuestion;
    }

    /**
     * Get all questions
     */
    public List<QuestionDTO> getAllQuestions() {
        return questionRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get approved questions (for public display)
     */
    public List<QuestionDTO> getApprovedQuestions() {
        return questionRepository.findByModerationStatus("APPROVED")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get question by ID
     */
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Increment view count
        question.setViewCount(question.getViewCount() + 1);
        questionRepository.save(question);

        return convertToDTO(question);
    }

    /**
     * Get all questions by category
     */
    public List<QuestionDTO> getQuestionsByCategory(String category) {
        try {
            Question.QuestionCategory cat = Question.QuestionCategory.valueOf(category.toUpperCase());
            return questionRepository.findByCategoryOrderByUpvotesDesc(cat)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category");
        }
    }

    /**
     * Get all unresolved questions
     */
    public List<QuestionDTO> getUnresolvedQuestions() {
        return questionRepository.findByIsResolvedFalse()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search questions by title
     */
    public List<QuestionDTO> searchQuestions(String keyword) {
        return questionRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Toggle upvote on a question.
     * If user already upvoted, removes the upvote.
     * If user had downvoted, switches to upvote.
     * Returns a map with the action taken and current counts.
     */
    @Transactional
    public Map<String, Object> upvoteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Vote> existingVote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                userId, Vote.VotableType.QUESTION, questionId);

        String action;
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getVoteType() == Vote.VoteType.UPVOTE) {
                // Already upvoted — remove the upvote (toggle off)
                voteRepository.delete(vote);
                question.setUpvotes(Math.max(0, question.getUpvotes() - 1));
                action = "removed";
            } else {
                // Was a downvote — switch to upvote
                vote.setVoteType(Vote.VoteType.UPVOTE);
                voteRepository.save(vote);
                question.setUpvotes(question.getUpvotes() + 1);
                question.setDownvoteCount(Math.max(0, question.getDownvoteCount() - 1));
                action = "upvoted";
            }
        } else {
            // No vote yet — create upvote
            Vote vote = Vote.builder()
                    .user(user)
                    .votableType(Vote.VotableType.QUESTION)
                    .votableId(questionId)
                    .voteType(Vote.VoteType.UPVOTE)
                    .build();
            voteRepository.save(vote);
            question.setUpvotes(question.getUpvotes() + 1);
            action = "upvoted";
        }

        questionRepository.save(question);
        logActivity(userId, "UPVOTE_QUESTION", questionId, "QUESTION");

        return Map.of(
                "action", action,
                "upvotes", question.getUpvotes(),
                "downvotes", question.getDownvoteCount(),
                "userVote", action.equals("removed") ? "none" : "upvote"
        );
    }

    /**
     * Toggle downvote on a question.
     * If user already downvoted, removes the downvote.
     * If user had upvoted, switches to downvote.
     */
    @Transactional
    public Map<String, Object> downvoteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Vote> existingVote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                userId, Vote.VotableType.QUESTION, questionId);

        String action;
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getVoteType() == Vote.VoteType.DOWNVOTE) {
                // Already downvoted — remove the downvote (toggle off)
                voteRepository.delete(vote);
                question.setDownvoteCount(Math.max(0, question.getDownvoteCount() - 1));
                action = "removed";
            } else {
                // Was an upvote — switch to downvote
                vote.setVoteType(Vote.VoteType.DOWNVOTE);
                voteRepository.save(vote);
                question.setDownvoteCount(question.getDownvoteCount() + 1);
                question.setUpvotes(Math.max(0, question.getUpvotes() - 1));
                action = "downvoted";
            }
        } else {
            // No vote yet — create downvote
            Vote vote = Vote.builder()
                    .user(user)
                    .votableType(Vote.VotableType.QUESTION)
                    .votableId(questionId)
                    .voteType(Vote.VoteType.DOWNVOTE)
                    .build();
            voteRepository.save(vote);
            question.setDownvoteCount(question.getDownvoteCount() + 1);
            action = "downvoted";
        }

        questionRepository.save(question);
        logActivity(userId, "DOWNVOTE_QUESTION", questionId, "QUESTION");

        return Map.of(
                "action", action,
                "upvotes", question.getUpvotes(),
                "downvotes", question.getDownvoteCount(),
                "userVote", action.equals("removed") ? "none" : "downvote"
        );
    }

    /**
     * Get the current user's vote status on a question.
     */
    public String getUserVoteStatus(Long questionId, Long userId) {
        Optional<Vote> vote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                userId, Vote.VotableType.QUESTION, questionId);
        if (vote.isPresent()) {
            return vote.get().getVoteType() == Vote.VoteType.UPVOTE ? "upvote" : "downvote";
        }
        return "none";
    }

    /**
     * Update question
     */
    public Question updateQuestion(Long questionId, String title, String content, String category) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (title != null && !title.isEmpty()) {
            question.setTitle(title);
        }
        if (content != null && !content.isEmpty()) {
            question.setContent(content);
        }
        if (category != null && !category.isEmpty()) {
            question.setCategory(Question.QuestionCategory.valueOf(category.toUpperCase()));
        }

        return questionRepository.save(question);
    }

    /**
     * Delete question
     */
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }

    /**
     * Get questions by author
     */
    public List<QuestionDTO> getQuestionsByAuthor(Long userId) {
        return questionRepository.findByAuthorId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark question as resolved
     */
    public void markAsResolved(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setIsResolved(true);
        questionRepository.save(question);
    }

    /**
     * Log activity in MongoDB
     */
    private void logActivity(Long userId, String actionType, Long targetId, String targetType) {
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
    }

    /**
     * Convert Question entity to QuestionDTO
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
