package com.agrocare.repository.nosql;

import com.agrocare.model.nosql.Answer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LegacyAnswerRepository extends MongoRepository<Answer, String> {
    List<Answer> findByQuestionId(Long questionId);
    List<Answer> findByAuthorId(Long authorId);
    List<Answer> findByIsAcceptedTrue();
    List<Answer> findByQuestionIdOrderByUpvotesDesc(Long questionId);
    List<Answer> findByQuestionIdOrderByHelpfulCountDesc(Long questionId);
    List<Answer> findByModerationStatusAndIsModeratedFalse(String status);
}
