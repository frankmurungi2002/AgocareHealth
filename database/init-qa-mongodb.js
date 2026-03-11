// ============================================
// AGROCARE MONGODB - Q&A PLATFORM COLLECTIONS
// ============================================
// Run: mongosh < init-qa-mongodb.js

use agrocare_nosql;

// ============================================
// COMMENTS COLLECTION (updated schema)
// ============================================
db.createCollection("qa_comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "commentableType", "commentableId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "long", description: "Reference to PostgreSQL user ID" },
        username: { bsonType: "string" },
        userType: { bsonType: "string", enum: ["PATIENT", "MEDICAL_PROFESSIONAL", "VERIFIED_DOCTOR"] },
        profilePicture: { bsonType: ["string", "null"] },
        commentableType: { bsonType: "string", enum: ["QUESTION", "ANSWER"] },
        commentableId: { bsonType: "long", description: "PostgreSQL question/answer ID" },
        content: { bsonType: "string", minLength: 1, maxLength: 1000 },
        parentCommentId: { bsonType: ["objectId", "null"], description: "For nested replies" },
        likes: { bsonType: "int" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.qa_comments.createIndex({ commentableType: 1, commentableId: 1 });
db.qa_comments.createIndex({ userId: 1 });
db.qa_comments.createIndex({ createdAt: -1 });
db.qa_comments.createIndex({ parentCommentId: 1 });

// ============================================
// NOTIFICATIONS COLLECTION
// ============================================
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "message"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "long", description: "Recipient user ID" },
        type: { 
          bsonType: "string", 
          enum: ["NEW_ANSWER", "COMMENT", "UPVOTE", "FOLLOW", "ACCEPTED_ANSWER", "MENTION"] 
        },
        referenceType: { bsonType: "string", enum: ["QUESTION", "ANSWER", "COMMENT"] },
        referenceId: { bsonType: "long" },
        actorId: { bsonType: "long", description: "Who triggered it" },
        actorName: { bsonType: "string" },
        message: { bsonType: "string" },
        isRead: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, createdAt: -1 });

// ============================================
// ACTIVITY LOGS - add new index
// ============================================
db.activity_logs.createIndex({ "action": 1 });

print("✅ Q&A platform MongoDB collections created:");
print("   - qa_comments (with validation & indexes)");
print("   - notifications (with validation & indexes)");
print("   - activity_logs indexes updated");
