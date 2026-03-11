package com.agrocare.repository.sql;

import com.agrocare.model.sql.Answer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    Page<Answer> findByQuestionIdOrderByCreatedAtDesc(Long questionId, Pageable pageable);

    List<Answer> findByQuestionId(Long questionId);

    @Query("SELECT a FROM Answer a JOIN FETCH a.author WHERE a.question.id = :questionId ORDER BY a.isAccepted DESC, a.upvoteCount DESC")
    List<Answer> findByQuestionIdWithAuthor(@Param("questionId") Long questionId);

    long countByQuestionId(Long questionId);

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.question.id = :questionId AND a.author.role IN ('DOCTOR', 'NURSE', 'PROFESSOR', 'HEALTH_WORKER')")
    long countMedicalAnswersByQuestionId(@Param("questionId") Long questionId);

    List<Answer> findByAuthorId(Long authorId);

    Optional<Answer> findByIdAndAuthorId(Long id, Long authorId);

    List<Answer> findByQuestionIdOrderByIsAcceptedDescCreatedAtAsc(Long questionId);

    Optional<Answer> findByQuestionIdAndIsAcceptedTrue(Long questionId);
}
