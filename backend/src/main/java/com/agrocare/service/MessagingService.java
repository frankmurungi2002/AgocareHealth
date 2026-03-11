package com.agrocare.service;

import com.agrocare.model.nosql.Conversation;
import com.agrocare.model.nosql.Conversation.ParticipantInfo;
import com.agrocare.model.nosql.Message;
import com.agrocare.model.sql.User;
import com.agrocare.repository.nosql.ConversationRepository;
import com.agrocare.repository.nosql.MessageRepository;
import com.agrocare.repository.sql.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessagingService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get or create a conversation between two users.
     */
    public Conversation getOrCreateConversation(Long userId1, Long userId2) {
        List<Long> participantIds = Arrays.asList(
                Math.min(userId1, userId2),
                Math.max(userId1, userId2)
        );

        return conversationRepository.findByParticipantIdsContainingAll(participantIds)
                .orElseGet(() -> {
                    User user1 = userRepository.findById(userId1)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
                    User user2 = userRepository.findById(userId2)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId2));

                    Conversation conversation = Conversation.builder()
                            .participantIds(participantIds)
                            .participants(Arrays.asList(
                                    buildParticipantInfo(user1),
                                    buildParticipantInfo(user2)
                            ))
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return conversationRepository.save(conversation);
                });
    }

    /**
     * Send a message in a conversation.
     */
    public Message sendMessage(String conversationId, Long senderId, String content, String messageType) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Find recipient (the other participant)
        Long recipientId = conversation.getParticipantIds().stream()
                .filter(id -> !id.equals(senderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Recipient not found in conversation"));

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .senderName(sender.getName())
                .senderRole(sender.getRole().name())
                .recipientId(recipientId)
                .content(content)
                .messageType(messageType != null ? messageType : "TEXT")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(message);

        // Update conversation metadata
        conversation.setLastMessage(content.length() > 100 ? content.substring(0, 100) + "..." : content);
        conversation.setLastMessageSenderId(senderId);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.incrementUnreadFor(recipientId);
        conversationRepository.save(conversation);

        return saved;
    }

    /**
     * Get all messages in a conversation and mark as read for the requesting user.
     */
    public List<Message> getMessages(String conversationId, Long requestingUserId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark unread messages as read for this user
        List<Message> unread = messages.stream()
                .filter(m -> m.getRecipientId().equals(requestingUserId) && !m.getIsRead())
                .collect(Collectors.toList());

        if (!unread.isEmpty()) {
            unread.forEach(m -> m.setIsRead(true));
            messageRepository.saveAll(unread);

            // Reset unread count on conversation
            conversationRepository.findById(conversationId).ifPresent(conv -> {
                conv.resetUnreadFor(requestingUserId);
                conversationRepository.save(conv);
            });
        }

        return messages;
    }

    /**
     * Get all conversations for a user, sorted by most recent.
     */
    public List<Map<String, Object>> getConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findByParticipantIdsContaining(userId);

        // Sort by lastMessageAt descending
        conversations.sort((a, b) -> {
            LocalDateTime timeA = a.getLastMessageAt() != null ? a.getLastMessageAt() : a.getCreatedAt();
            LocalDateTime timeB = b.getLastMessageAt() != null ? b.getLastMessageAt() : b.getCreatedAt();
            return timeB.compareTo(timeA);
        });

        return conversations.stream().map(conv -> {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", conv.getId());
            dto.put("participantIds", conv.getParticipantIds());

            // Find the other participant's info
            ParticipantInfo otherParticipant = conv.getParticipants().stream()
                    .filter(p -> !p.getUserId().equals(userId))
                    .findFirst()
                    .orElse(null);

            dto.put("otherParticipant", otherParticipant);
            dto.put("lastMessage", conv.getLastMessage());
            dto.put("lastMessageAt", conv.getLastMessageAt());
            dto.put("unreadCount", conv.getUnreadCountForUser(userId));
            dto.put("createdAt", conv.getCreatedAt());

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Get total unread message count for a user.
     */
    public long getUnreadCount(Long userId) {
        return messageRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    /**
     * Start a new conversation and optionally send the first message.
     */
    public Map<String, Object> startConversation(Long senderId, Long recipientId, String initialMessage) {
        Conversation conversation = getOrCreateConversation(senderId, recipientId);

        Message message = null;
        if (initialMessage != null && !initialMessage.isBlank()) {
            message = sendMessage(conversation.getId(), senderId, initialMessage, "TEXT");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("conversation", conversation);
        result.put("message", message);
        return result;
    }

    private ParticipantInfo buildParticipantInfo(User user) {
        String name = user.getName() != null ? user.getName() : user.getUsername();
        String initials = Arrays.stream(name.split(" "))
                .map(w -> String.valueOf(w.charAt(0)))
                .limit(2)
                .collect(Collectors.joining())
                .toUpperCase();

        return ParticipantInfo.builder()
                .userId(user.getId())
                .name(name)
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .initials(initials)
                .build();
    }
}
