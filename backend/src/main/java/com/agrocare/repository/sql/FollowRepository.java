package com.agrocare.repository.sql;

import com.agrocare.model.sql.Follow;
import com.agrocare.model.sql.Follow.FollowableType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFollowableTypeAndFollowableId(
            Long followerId, FollowableType followableType, Long followableId);

    boolean existsByFollowerIdAndFollowableTypeAndFollowableId(
            Long followerId, FollowableType followableType, Long followableId);

    List<Follow> findByFollowerIdAndFollowableType(Long followerId, FollowableType followableType);

    @Modifying
    @Query("DELETE FROM Follow f WHERE f.follower.id = :followerId AND f.followableType = :followableType AND f.followableId = :followableId")
    void deleteByFollowerIdAndFollowableTypeAndFollowableId(
            @Param("followerId") Long followerId,
            @Param("followableType") FollowableType followableType,
            @Param("followableId") Long followableId);

    long countByFollowableTypeAndFollowableId(FollowableType followableType, Long followableId);
}
