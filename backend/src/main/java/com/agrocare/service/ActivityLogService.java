package com.agrocare.service;

import com.agrocare.model.nosql.ActivityLog;
import com.agrocare.repository.nosql.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    public void logActivity(Long userId, String username, String actionType, String targetType, 
                           Long targetId, String actionTarget, boolean isSuccessful, String errorMessage) {
        try {
            ActivityLog activityLog = ActivityLog.builder()
                    .userId(userId)
                    .username(username)
                    .actionType(actionType)
                    .targetType(targetType)
                    .targetId(targetId)
                    .actionTarget(actionTarget)
                    .timestamp(LocalDateTime.now())
                    .isSuccessful(isSuccessful)
                    .errorMessage(errorMessage)
                    .status("NEW")
                    .build();
            
            activityLogRepository.save(activityLog);
            log.debug("Activity logged: {} - {}", actionType, username);
        } catch (Exception e) {
            log.error("Failed to log activity: {}", e.getMessage());
        }
    }

    public void logLogin(Long userId, String username, boolean successful, String errorMessage) {
        logActivity(userId, username, "LOGIN", null, null, null, successful, errorMessage);
    }

    public void logRegistration(Long userId, String username, boolean successful, String errorMessage) {
        logActivity(userId, username, "REGISTER", null, null, null, successful, errorMessage);
    }

    public void logQuestionCreated(Long userId, String username, Long questionId, String questionTitle) {
        logActivity(userId, username, "CREATE_QUESTION", "QUESTION", questionId, questionTitle, true, null);
    }

    public void logAnswerCreated(Long userId, String username, Long answerId, Long questionId) {
        logActivity(userId, username, "CREATE_ANSWER", "ANSWER", answerId, "Question-" + questionId, true, null);
    }

    public void logAppointmentCreated(Long userId, String username, Long appointmentId) {
        logActivity(userId, username, "CREATE_APPOINTMENT", "APPOINTMENT", appointmentId, null, true, null);
    }

    public List<ActivityLog> getUserActivities(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<ActivityLog> getRecentActivities(int limit) {
        return activityLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .limit(limit)
                .toList();
    }

    public List<ActivityLog> getActivitiesByType(String actionType) {
        return activityLogRepository.findByActionTypeOrderByTimestampDesc(actionType);
    }

    public Optional<ActivityLog> getActivityById(String id) {
        return activityLogRepository.findById(id);
    }
}
