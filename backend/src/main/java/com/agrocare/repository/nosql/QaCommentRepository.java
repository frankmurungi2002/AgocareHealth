package com.agrocare.repository.nosql;

import com.agrocare.model.nosql.QaComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QaCommentRepository extends MongoRepository<QaComment, String> {

    Page<QaComment> findByCommentableTypeAndCommentableIdOrderByCreatedAtDesc(
            String commentableType, Long commentableId, Pageable pageable);

    List<QaComment> findByCommentableTypeAndCommentableIdAndParentCommentIdIsNullOrderByCreatedAtDesc(
            String commentableType, Long commentableId);

    List<QaComment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);

    long countByCommentableTypeAndCommentableId(String commentableType, Long commentableId);

    List<QaComment> findByUserId(Long userId);

    List<QaComment> findByCommentableTypeAndCommentableIdOrderByCreatedAtAsc(
            String commentableType, Long commentableId);

    List<QaComment> findByParentCommentId(String parentCommentId);
}
