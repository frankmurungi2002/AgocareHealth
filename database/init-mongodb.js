// ============================================
// AGROCARE MONGODB DATABASE INITIALIZATION
// ============================================
// This script creates the complete database schema for MongoDB
// Run this in MongoDB mongosh or Mongo console

// Switch to agrocare_nosql database
use agrocare_nosql;

// ============================================
// CREATE COLLECTIONS
// ============================================

// Create answers collection
db.createCollection("answers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["questionId", "authorId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        questionId: { bsonType: "long" },
        authorId: { bsonType: "long" },
        authorName: { bsonType: "string" },
        authorRole: { bsonType: "string" },
        content: { bsonType: "string" },
        upvotes: { bsonType: "int" },
        downvotes: { bsonType: "int" },
        isAccepted: { bsonType: "bool" },
        isModerated: { bsonType: "bool" },
        moderationStatus: { bsonType: "string" },
        tags: { bsonType: "array" },
        helpfulCount: { bsonType: "int" },
        comments: { bsonType: "array" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Create comments collection
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["answerId", "authorId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        answerId: { bsonType: "long" },
        authorId: { bsonType: "long" },
        authorName: { bsonType: "string" },
        content: { bsonType: "string" },
        upvotes: { bsonType: "int" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        isEdited: { bsonType: "bool" }
      }
    }
  }
});

// Create activity_logs collection
db.createCollection("activity_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "actionType"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "long" },
        username: { bsonType: "string" },
        actionType: { bsonType: "string" },
        actionTarget: { bsonType: "string" },
        targetType: { bsonType: "string" },
        targetId: { bsonType: "long" },
        ipAddress: { bsonType: "string" },
        userAgent: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        isSuccessful: { bsonType: "bool" },
        errorMessage: { bsonType: "string" },
        status: { bsonType: "string" }
      }
    }
  }
});

// Create reports collection
db.createCollection("reports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reporterId", "contentType", "contentId", "reason"],
      properties: {
        _id: { bsonType: "objectId" },
        reporterId: { bsonType: "long" },
        reporterUsername: { bsonType: "string" },
        contentType: { bsonType: "string" },
        contentId: { bsonType: "long" },
        reason: { bsonType: "string" },
        description: { bsonType: "string" },
        status: { bsonType: "string" },
        resolution: { bsonType: "string" },
        moderatorId: { bsonType: "long" },
        createdAt: { bsonType: "date" },
        resolvedAt: { bsonType: "date" },
        priority: { bsonType: "int" }
      }
    }
  }
});

// ============================================
// CREATE INDEXES
// ============================================

// Answers indexes
db.answers.createIndex({ questionId: 1 });
db.answers.createIndex({ authorId: 1 });
db.answers.createIndex({ isAccepted: 1 });
db.answers.createIndex({ createdAt: -1 });

// Comments indexes
db.comments.createIndex({ answerId: 1 });
db.comments.createIndex({ authorId: 1 });
db.comments.createIndex({ createdAt: -1 });

// Activity logs indexes
db.activity_logs.createIndex({ userId: 1 });
db.activity_logs.createIndex({ actionType: 1 });
db.activity_logs.createIndex({ timestamp: -1 });
db.activity_logs.createIndex({ status: 1 });

// Reports indexes
db.reports.createIndex({ reporterId: 1 });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ contentId: 1 });
db.reports.createIndex({ priority: -1 });

// ============================================
// INSERT SAMPLE DATA (OPTIONAL)
// ============================================

// Insert sample answers
db.answers.insertMany([
  {
    questionId: 1,
    authorId: 2,
    authorName: "Dr. James Smith",
    authorRole: "DOCTOR",
    content: "For fever in children, you can use paracetamol or ibuprofen based on the doctor's recommendation.",
    upvotes: 15,
    downvotes: 0,
    isAccepted: true,
    isModerated: true,
    moderationStatus: "APPROVED",
    tags: ["fever", "children", "treatment"],
    helpfulCount: 12,
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample activity logs
db.activity_logs.insertMany([
  {
    userId: 1,
    username: "admin_user",
    actionType: "LOGIN",
    actionTarget: "Auth System",
    targetType: "USER",
    targetId: 1,
    ipAddress: "127.0.0.1",
    userAgent: "Chrome",
    timestamp: new Date(),
    isSuccessful: true,
    status: "VIEWED"
  },
  {
    userId: 3,
    username: "patient_francis",
    actionType: "CREATE_QUESTION",
    actionTarget: "Question System",
    targetType: "QUESTION",
    targetId: 1,
    ipAddress: "127.0.0.1",
    userAgent: "Chrome",
    timestamp: new Date(),
    isSuccessful: true,
    status: "VIEWED"
  }
]);

// ============================================
// VERIFY COLLECTIONS CREATED
// ============================================
// Run this to check all collections
// db.getCollectionNames();

print("✓ MongoDB initialization complete!");
print("✓ Collections created: answers, comments, activity_logs, reports");
print("✓ Indexes created for optimal performance");
print("✓ Sample data inserted (optional)");
