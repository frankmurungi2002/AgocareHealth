package com.agrocare.repository.nosql;

import com.agrocare.model.nosql.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    List<Message> findByConversationIdAndIsReadFalseAndRecipientId(String conversationId, Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);
}
