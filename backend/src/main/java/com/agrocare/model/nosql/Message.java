package com.agrocare.model.nosql;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
@CompoundIndex(name = "conversation_idx", def = "{'conversationId': 1, 'createdAt': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    private String id;

    @Indexed
    private String conversationId;

    private Long senderId;
    private String senderName;
    private String senderRole; // DOCTOR, PATIENT

    private Long recipientId;

    private String content;
    private String messageType; // TEXT, IMAGE, FILE, SYSTEM

    @Builder.Default
    private Boolean isRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
