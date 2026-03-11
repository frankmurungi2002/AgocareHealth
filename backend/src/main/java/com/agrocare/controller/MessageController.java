package com.agrocare.controller;

import com.agrocare.model.nosql.Message;
import com.agrocare.service.MessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessagingService messagingService;

    /**
     * GET /api/messages/conversations?userId={userId}
     * Get all conversations for a user.
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(@RequestParam Long userId) {
        try {
            List<Map<String, Object>> conversations = messagingService.getConversations(userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("data", conversations);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /api/messages/{conversationId}?userId={userId}
     * Get all messages in a conversation (marks as read for userId).
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<?> getMessages(
            @PathVariable String conversationId,
            @RequestParam Long userId) {
        try {
            List<Message> messages = messagingService.getMessages(conversationId, userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /api/messages/send
     * Send a message in an existing conversation.
     * Body: { conversationId, senderId, content, messageType? }
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> body) {
        try {
            String conversationId = (String) body.get("conversationId");
            Long senderId = Long.valueOf(body.get("senderId").toString());
            String content = (String) body.get("content");
            String messageType = (String) body.getOrDefault("messageType", "TEXT");

            if (content == null || content.isBlank()) {
                return errorResponse("Message content cannot be empty", HttpStatus.BAD_REQUEST);
            }

            Message message = messagingService.sendMessage(conversationId, senderId, content, messageType);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "Message sent");
            response.put("data", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * POST /api/messages/conversations/start
     * Start a new conversation (or get existing) with an optional first message.
     * Body: { senderId, recipientId, message? }
     */
    @PostMapping("/conversations/start")
    public ResponseEntity<?> startConversation(@RequestBody Map<String, Object> body) {
        try {
            Long senderId = Long.valueOf(body.get("senderId").toString());
            Long recipientId = Long.valueOf(body.get("recipientId").toString());
            String initialMessage = (String) body.getOrDefault("message", null);

            Map<String, Object> result = messagingService.startConversation(senderId, recipientId, initialMessage);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "Conversation started");
            response.put("data", result);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * GET /api/messages/unread/count?userId={userId}
     * Get total unread message count.
     */
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(@RequestParam Long userId) {
        try {
            long count = messagingService.getUnreadCount(userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("data", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<?> errorResponse(String message, HttpStatus status) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("success", false);
        error.put("error", message);
        return ResponseEntity.status(status).body(error);
    }
}
