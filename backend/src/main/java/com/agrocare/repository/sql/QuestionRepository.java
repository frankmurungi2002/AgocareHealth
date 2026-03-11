package com.agrocare.repository.sql;

import com.agrocare.model.sql.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // ---- Paginated queries ----

    Page<Question> findByModerationStatus(String moderationStatus, Pageable pageable);

    Page<Question> findByStatus(Question.QuestionStatus status, Pageable pageable);

    Page<Question> findByCategoryEntityId(Long categoryId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.categoryEntity.slug = :slug AND q.moderationStatus = 'APPROVED'")
    Page<Question> findByCategorySlug(@Param("slug") String slug, Pageable pageable);

    Page<Question> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.moderationStatus = 'APPROVED' AND q.answerCount = 0")
    Page<Question> findUnanswered(Pageable pageable);

    // ---- JOIN FETCH for avoiding N+1 ----

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.author LEFT JOIN FETCH q.categoryEntity WHERE q.id = :id")
    Optional<Question> findByIdWithDetails(@Param("id") Long id);

    @Query(value = "SELECT q FROM Question q LEFT JOIN FETCH q.author LEFT JOIN FETCH q.categoryEntity WHERE q.moderationStatus = 'APPROVED'",
           countQuery = "SELECT COUNT(q) FROM Question q WHERE q.moderationStatus = 'APPROVED'")
    Page<Question> findApprovedWithDetails(Pageable pageable);

    @Query(value = "SELECT q FROM Question q LEFT JOIN FETCH q.author LEFT JOIN FETCH q.categoryEntity WHERE q.categoryEntity.slug = :slug AND q.moderationStatus = 'APPROVED'",
           countQuery = "SELECT COUNT(q) FROM Question q WHERE q.categoryEntity.slug = :slug AND q.moderationStatus = 'APPROVED'")
    Page<Question> findApprovedByCategorySlugWithDetails(@Param("slug") String slug, Pageable pageable);

    // ---- Search ----

    @Query("SELECT q FROM Question q WHERE q.moderationStatus = 'APPROVED' AND (LOWER(q.title) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(q.content) LIKE LOWER(CONCAT('%',:keyword,'%')))")
    Page<Question> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // ---- Legacy non-paginated queries (backward compat) ----

    List<Question> findByCategory(Question.QuestionCategory category);

    List<Question> findByAuthorId(Long authorId);

    List<Question> findByIsResolvedFalse();

    List<Question> findByModerationStatusOrderByCreatedAtDesc(String status);

    List<Question> findByModerationStatus(String status);

    @Query("SELECT q FROM Question q WHERE q.category = :category AND q.isModerated = true ORDER BY q.upvotes DESC")
    List<Question> findByCategoryOrderByUpvotesDesc(@Param("category") Question.QuestionCategory category);

    List<Question> findByTitleContainingIgnoreCase(String title);
}
