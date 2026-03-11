package com.agrocare.repository.nosql;

import com.agrocare.model.nosql.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByAnswerId(String answerId);
    List<Comment> findByAuthorId(Long authorId);
}
