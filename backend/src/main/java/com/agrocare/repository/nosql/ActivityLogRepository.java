package com.agrocare.repository.nosql;

import com.agrocare.model.nosql.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findByUserId(Long userId);
    List<ActivityLog> findByActionType(String actionType);
    List<ActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<ActivityLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<ActivityLog> findByActionTypeAndIsSuccessfulFalse(String actionType);
    List<ActivityLog> findTop100ByOrderByTimestampDesc();
    List<ActivityLog> findByActionTypeOrderByTimestampDesc(String actionType);
}
