package com.agrocare.service;

import com.agrocare.dto.request.AnswerCreateRequest;
import com.agrocare.dto.response.AnswerResponse;
import com.agrocare.exception.ApiException;
import com.agrocare.model.sql.Answer;
import com.agrocare.model.sql.Question;
import com.agrocare.model.sql.User;
import com.agrocare.repository.sql.AnswerRepository;
import com.agrocare.repository.sql.QuestionRepository;
import com.agrocare.repository.sql.UserRepository;
import com.agrocare.repository.sql.VoteRepository;
import com.agrocare.model.sql.Vote;
import com.agrocare.util.QaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for SQL-based answers in the dynamic Q&A system.
 * Named QaAnswerService to avoid conflicts with the legacy AnswerService (MongoDB).
 */
@Slf4j
@Service("qaAnswerService")
@RequiredArgsConstructor
public class QaAnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final QaMapper mapper;

    @Transactional
    public AnswerResponse createAnswer(Long questionId, AnswerCreateRequest request, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> ApiException.notFound("Question not found: " + questionId));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found: " + userId));

        Answer answer = Answer.builder()
                .question(question)
                .author(author)
                .content(request.getContent())
                .isAccepted(false)
                .upvoteCount(0)
                .downvoteCount(0)
                .commentCount(0)
                .build();

        Answer saved = answerRepository.save(answer);

        // Update question counts
        question.setAnswerCount(question.getAnswerCount() + 1);
        if (author.isMedicalProfessional()) {
            question.setMedicalAnswerCount(
                    (question.getMedicalAnswerCount() != null ? question.getMedicalAnswerCount() : 0) + 1);
        }
        if (question.getStatus() == Question.QuestionStatus.OPEN) {
            question.setStatus(Question.QuestionStatus.ANSWERED);
        }
        questionRepository.save(question);

        log.info("User {} answered question {}", userId, questionId);
        return mapper.toAnswerResponse(saved);
    }

    public List<AnswerResponse> getAnswersForQuestion(Long questionId, Long currentUserId) {
        List<Answer> answers = answerRepository.findByQuestionIdOrderByIsAcceptedDescCreatedAtAsc(questionId);
        return answers.stream().map(answer -> {
            boolean hasUpvoted = false;
            boolean hasDownvoted = false;
            if (currentUserId != null) {
                Optional<Vote> userVote = voteRepository.findByUserIdAndVotableTypeAndVotableId(
                        currentUserId, Vote.VotableType.ANSWER, answer.getId());
                hasUpvoted = userVote.map(v -> v.getVoteType() == Vote.VoteType.UPVOTE).orElse(false);
                hasDownvoted = userVote.map(v -> v.getVoteType() == Vote.VoteType.DOWNVOTE).orElse(false);
            }
            return mapper.toAnswerResponse(answer, hasUpvoted, hasDownvoted);
        }).collect(Collectors.toList());
    }

    @Transactional
    public AnswerResponse acceptAnswer(Long answerId, Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> ApiException.notFound("Question not found"));
        if (question.getAuthor() == null || !question.getAuthor().getId().equals(userId)) {
            throw ApiException.forbidden("Only the question author can accept an answer");
        }

        // Un-accept any previously accepted answer
        answerRepository.findByQuestionIdAndIsAcceptedTrue(questionId)
                .ifPresent(prev -> {
                    prev.setIsAccepted(false);
                    answerRepository.save(prev);
                });

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> ApiException.notFound("Answer not found"));
        answer.setIsAccepted(true);
        Answer saved = answerRepository.save(answer);

        question.setIsResolved(true);
        question.setStatus(Question.QuestionStatus.ANSWERED);
        questionRepository.save(question);

        return mapper.toAnswerResponse(saved);
    }

    @Transactional
    public AnswerResponse updateAnswer(Long answerId, String content, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> ApiException.notFound("Answer not found"));
        if (answer.getAuthor() == null || !answer.getAuthor().getId().equals(userId)) {
            throw ApiException.forbidden("You can only edit your own answers");
        }
        answer.setContent(content);
        Answer saved = answerRepository.save(answer);
        return mapper.toAnswerResponse(saved);
    }

    @Transactional
    public void deleteAnswer(Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> ApiException.notFound("Answer not found"));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        boolean isOwner = answer.getAuthor() != null && answer.getAuthor().getId().equals(userId);
        boolean isAdmin = requester.getRole() == User.UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("You can only delete your own answers");
        }

        // Decrement question answer count
        Question question = answer.getQuestion();
        if (question != null) {
            question.setAnswerCount(Math.max(0, question.getAnswerCount() - 1));
            if (answer.getAuthor() != null && answer.getAuthor().isMedicalProfessional()) {
                question.setMedicalAnswerCount(
                        Math.max(0, (question.getMedicalAnswerCount() != null ? question.getMedicalAnswerCount() : 0) - 1));
            }
            questionRepository.save(question);
        }

        answerRepository.delete(answer);
        log.info("User {} deleted answer {}", userId, answerId);
    }
}
