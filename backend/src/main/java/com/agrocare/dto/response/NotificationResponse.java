package com.agrocare.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private String id;
    private String type;
    private String referenceType;
    private String referenceId;
    private String actorName;
    private String message;
    private boolean isRead;
    private String timeAgo;
    private LocalDateTime createdAt;
}
