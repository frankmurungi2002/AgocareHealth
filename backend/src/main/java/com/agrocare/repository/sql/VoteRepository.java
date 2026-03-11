package com.agrocare.repository.sql;

import com.agrocare.model.sql.Vote;
import com.agrocare.model.sql.Vote.VotableType;
import com.agrocare.model.sql.Vote.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndVotableTypeAndVotableId(Long userId, VotableType votableType, Long votableId);

    long countByVotableTypeAndVotableIdAndVoteType(VotableType votableType, Long votableId, VoteType voteType);

    @Modifying
    @Query("DELETE FROM Vote v WHERE v.user.id = :userId AND v.votableType = :votableType AND v.votableId = :votableId")
    void deleteByUserIdAndVotableTypeAndVotableId(
            @Param("userId") Long userId,
            @Param("votableType") VotableType votableType,
            @Param("votableId") Long votableId);

    boolean existsByUserIdAndVotableTypeAndVotableId(Long userId, VotableType votableType, Long votableId);
}
