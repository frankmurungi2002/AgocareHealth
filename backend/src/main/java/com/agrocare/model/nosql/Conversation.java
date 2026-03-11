package com.agrocare.model.nosql;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "conversations")
@CompoundIndex(name = "participants_idx", def = "{'participantIds': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    @Id
    private String id;

    /** The two user IDs in this conversation */
    @Builder.Default
    private List<Long> participantIds = new ArrayList<>();

    /** Display info for quick rendering */
    @Builder.Default
    private List<ParticipantInfo> participants = new ArrayList<>();

    private String lastMessage;
    private Long lastMessageSenderId;
    private LocalDateTime lastMessageAt;

    @Builder.Default
    private Integer unreadCountUser1 = 0; // unread for participantIds[0]

    @Builder.Default
    private Integer unreadCountUser2 = 0; // unread for participantIds[1]

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantInfo {
        private Long userId;
        private String name;
        private String role;
        private String profilePicture;
        private String initials;
    }

    /** Get unread count for a specific user */
    public int getUnreadCountForUser(Long userId) {
        if (participantIds.size() < 2) return 0;
        if (participantIds.get(0).equals(userId)) return unreadCountUser1 != null ? unreadCountUser1 : 0;
        if (participantIds.get(1).equals(userId)) return unreadCountUser2 != null ? unreadCountUser2 : 0;
        return 0;
    }

    /** Increment unread count for a specific user */
    public void incrementUnreadFor(Long userId) {
        if (participantIds.size() < 2) return;
        if (participantIds.get(0).equals(userId)) {
            unreadCountUser1 = (unreadCountUser1 != null ? unreadCountUser1 : 0) + 1;
        } else if (participantIds.get(1).equals(userId)) {
            unreadCountUser2 = (unreadCountUser2 != null ? unreadCountUser2 : 0) + 1;
        }
    }

    /** Reset unread count for a specific user */
    public void resetUnreadFor(Long userId) {
        if (participantIds.size() < 2) return;
        if (participantIds.get(0).equals(userId)) unreadCountUser1 = 0;
        else if (participantIds.get(1).equals(userId)) unreadCountUser2 = 0;
    }
}
