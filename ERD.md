# 📊 ClassBook Management System - Entity Relationship Diagram (ERD)

## Database Schema Overview

The ClassBook Management System uses a PostgreSQL database with the following entity relationships:

## ERD Diagram

```mermaid
erDiagram
    User {
        string id PK "UUID Primary Key"
        string email UK "Unique Email"
        string password "Hashed Password"
        string role "user | Admin"
        datetime createdAt "Creation Timestamp"
        datetime updatedAt "Last Update"
    }

    Class {
        string id PK "UUID Primary Key"
        string name "Class Name"
        string description "Class Description"
        datetime createdAt "Creation Timestamp"
        datetime updatedAt "Last Update"
    }

    Session {
        string id PK "UUID Primary Key"
        string classId FK "References Class.id"
        datetime startTime "Session Start"
        datetime endTime "Session End"
        int capacity "Maximum Seats"
        datetime createdAt "Creation Timestamp"
        datetime updatedAt "Last Update"
    }

    Booking {
        int id PK "Auto-increment Primary Key"
        string userId FK "References User.id"
        string sessionId FK "References Session.id"
        datetime bookedAt "Booking Timestamp"
        string status "booked | cancelled"
    }

    AuditLog {
        string id PK "UUID Primary Key"
        string entity "Entity Type"
        string entityId "Entity ID"
        string action "Action Performed"
        json details "Additional Details"
        datetime timestamp "Action Timestamp"
        string userId FK "References User.id (nullable)"
    }

    %% Relationships
    User ||--o{ Booking : "makes"
    User ||--o{ AuditLog : "performs"
    Class ||--o{ Session : "has"
    Session ||--o{ Booking : "receives"

    %% Unique Constraints
    Booking }o--|| User : "unique(userId, sessionId)"
```

## Entity Descriptions

### 1. User Entity

- **Purpose**: Stores user authentication and profile information
- **Key Features**:
  - UUID primary key for security
  - Unique email constraint
  - Role-based access control (user/Admin)
  - Password hashing for security
  - Audit timestamps

### 2. Class Entity

- **Purpose**: Represents different types of classes available for booking
- **Key Features**:
  - UUID primary key
  - Name and description fields
  - One-to-many relationship with Sessions
  - Audit timestamps

### 3. Session Entity

- **Purpose**: Represents specific time slots for classes with capacity limits
- **Key Features**:
  - UUID primary key
  - Foreign key to Class
  - Start and end time tracking
  - Capacity management
  - One-to-many relationship with Bookings

### 4. Booking Entity

- **Purpose**: Tracks user reservations for specific sessions
- **Key Features**:
  - Auto-increment integer primary key
  - Foreign keys to User and Session
  - Unique constraint preventing double-booking
  - Status tracking (booked/cancelled)
  - Booking timestamp

### 5. AuditLog Entity

- **Purpose**: Tracks all system activities for compliance and debugging
- **Key Features**:
  - UUID primary key
  - Generic entity tracking (entity + entityId)
  - Action logging
  - JSON details field for flexibility
  - Optional user reference
  - Timestamp for chronological tracking

## Relationship Details

### User ↔ Booking (One-to-Many)

- **Relationship**: A user can make multiple bookings
- **Constraint**: Each booking belongs to exactly one user
- **Business Rule**: Users cannot double-book the same session

### User ↔ AuditLog (One-to-Many)

- **Relationship**: A user can perform multiple actions
- **Constraint**: Each audit log entry can optionally reference a user
- **Business Rule**: System actions are tracked for accountability

### Class ↔ Session (One-to-Many)

- **Relationship**: A class can have multiple sessions
- **Constraint**: Each session belongs to exactly one class
- **Business Rule**: Sessions inherit class properties

### Session ↔ Booking (One-to-Many)

- **Relationship**: A session can receive multiple bookings
- **Constraint**: Each booking belongs to exactly one session
- **Business Rule**: Bookings cannot exceed session capacity

## Database Constraints

### Primary Keys

- All entities have unique primary keys
- User, Class, Session, AuditLog use UUIDs
- Booking uses auto-increment integer

### Foreign Keys

- Session.classId → Class.id
- Booking.userId → User.id
- Booking.sessionId → Session.id
- AuditLog.userId → User.id (nullable)

### Unique Constraints

- User.email (unique)
- Booking(userId, sessionId) (composite unique)

### Check Constraints

- User.role IN ('user', 'Admin')
- Booking.status IN ('booked', 'cancelled')
- Session.capacity > 0
- Session.endTime > Session.startTime

## Indexes

### Performance Indexes

```sql
-- User table
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- Session table
CREATE INDEX idx_session_class_id ON "Session"("classId");
CREATE INDEX idx_session_start_time ON "Session"("startTime");

-- Booking table
CREATE INDEX idx_booking_user_id ON "Booking"("userId");
CREATE INDEX idx_booking_session_id ON "Booking"("sessionId");
CREATE INDEX idx_booking_booked_at ON "Booking"("bookedAt");

-- AuditLog table
CREATE INDEX idx_audit_log_entity ON "AuditLog"(entity);
CREATE INDEX idx_audit_log_timestamp ON "AuditLog"(timestamp);
CREATE INDEX idx_audit_log_user_id ON "AuditLog"("userId");
```

## Data Flow Examples

### 1. User Registration Flow

```
User → User Table
- Generate UUID
- Hash password
- Set default role
- Record timestamps
```

### 2. Session Booking Flow

```
User + Session → Booking Table
- Check capacity
- Verify no existing booking
- Create booking record
- Update audit log
```

### 3. Admin Class Creation Flow

```
Admin → Class Table → Session Table
- Create class
- Create sessions for class
- Log admin actions
```

## Security Considerations

### Data Protection

- Passwords are hashed using bcrypt
- UUIDs prevent enumeration attacks
- Foreign key constraints maintain referential integrity
- Audit logging provides accountability

### Access Control

- Role-based permissions at application level
- Database-level constraints prevent invalid data
- Unique constraints prevent duplicate bookings
- Timestamps provide audit trail

## Scalability Considerations

### Performance

- Indexes on frequently queried fields
- Efficient foreign key relationships
- Minimal data redundancy
- Optimized query patterns

### Growth

- UUID primary keys support distributed systems
- Flexible audit logging system
- Scalable booking capacity management
- Extensible entity relationship model

---

_This ERD provides a comprehensive view of the ClassBook Management System's database design and relationships._
