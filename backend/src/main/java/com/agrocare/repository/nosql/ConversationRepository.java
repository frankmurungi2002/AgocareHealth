package com.agrocare.repository.nosql;

import com.agrocare.model.nosql.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query("{ 'participantIds': { $all: ?0 } }")
    Optional<Conversation> findByParticipantIdsContainingAll(List<Long> participantIds);

    @Query("{ 'participantIds': ?0 }")
    List<Conversation> findByParticipantIdsContaining(Long userId);

    List<Conversation> findByParticipantIdsInOrderByLastMessageAtDesc(List<Long> userId);
}
