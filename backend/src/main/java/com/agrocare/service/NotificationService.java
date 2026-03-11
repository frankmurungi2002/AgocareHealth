package com.agrocare.service;

import com.agrocare.dto.response.NotificationResponse;
import com.agrocare.model.nosql.Notification;
import com.agrocare.repository.nosql.NotificationRepository;
import com.agrocare.util.QaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user notifications stored in MongoDB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final QaMapper mapper;

    /**
     * Create a notification for a user action.
     */
    public void createNotification(Long userId, String type, String referenceType,
                                    Long referenceId, Long actorId, String actorName,
                                    String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .actorId(actorId)
                .actorName(actorName)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user (most recent first).
     */
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged()).stream()
                .map(mapper::toNotificationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for a user.
     */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toNotificationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Count unread notifications.
     */
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a single notification as read.
     */
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    /**
     * Mark all notifications for a user as read.
     */
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
