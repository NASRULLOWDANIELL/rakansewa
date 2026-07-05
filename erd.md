# Entity-Relationship Diagram (ERD) - RakanSewa Database Schema

Below is the database Entity-Relationship Diagram (ERD) for the **RakanSewa** system. It details the database tables, field data types, primary/foreign keys, and relational linkages.

## 1. Visual Schema Diagram

![RakanSewa ERD](./rakansewa_erd.png)

---

## 2. Interactive Mermaid ERD

Use this Mermaid diagram to view relationships and copy structure for database design or schema setups:

```mermaid
erDiagram
    users {
        Long id PK
        String name
        String email "Unique"
        String password
        String role "Student, Owner, Admin"
        Boolean isListedAsHousemate
        Double budget
        String lifestyle
        String sleepSchedule
        String phoneNumber
        Boolean allowContact
        Boolean showWhatsapp
        String matricNumber
        String uitmEmail
        Boolean isStudentVerified
        Boolean emailVerified
        String emailVerificationToken
        LocalDateTime emailVerificationTokenExpiry
        String authProvider
        String priority1
        String priority2
        String priority3
        String profileImageUrl
        Long linked_property_id FK "References properties(id)"
    }

    properties {
        Long id PK
        String title
        String description
        String address
        String city
        String state
        Double monthlyRent
        String roomType "Single, Master, Middle"
        String propertyType "Apartment, Terrace, Condo"
        String furnishedStatus "Fully, Partially, Unfurnished"
        String availabilityStatus "Available, Occupied"
        Long ownerId FK "References users(id)"
        String imageUrl
        Double latitude
        Double longitude
        String approvalStatus "Pending, Approved, Rejected"
        String rejectionReason
        String amenities "Comma-separated list"
        LocalDateTime updatedAt
        String changeLog
    }

    property_images {
        Long id PK
        Long property_id FK "References properties(id)"
        String imageUrl
        LocalDateTime createdAt
    }

    property_updates {
        Long id PK
        Long propertyId FK "References properties(id)"
        String title
        String imageUrl
        String city
        String state
        String changeLog
        LocalDateTime updatedAt
    }

    favorites {
        Long id PK
        String userEmail FK "References users(email)"
        Long property_id FK "References properties(id)"
    }

    feedbacks {
        Long id PK
        Long userId FK "References users(id)"
        String category "Comment, Suggestion, Report"
        String subject
        String message
        LocalDateTime createdAt
        Boolean isResolved
    }

    password_reset_tokens {
        Long id PK
        Long user_id FK "References users(id)"
        String token "Unique"
        LocalDateTime expiresAt
        Boolean used
        LocalDateTime createdAt
    }

    users ||--o| properties : "has linked property"
    users ||--o{ properties : "owns (as Owner)"
    properties ||--o{ property_images : "contains"
    properties ||--o{ property_updates : "has historical logs"
    users ||--o{ favorites : "marks as favorite"
    properties ||--o{ favorites : "is favorited by"
    users ||--o{ feedbacks : "submits"
    users ||--o{ password_reset_tokens : "requests reset for"
```

---

## 3. Entity Definitions & Attribute Details

### A. `users` Table
Stores authentication and profile information for Students, Property Owners, and System Administrators.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`linked_property_id` (FK)**: References the `properties` table. Represents the housemate's linked rental house.
- **`email`**: Unique user email address.
- **`role`**: Characterizes user permissions (`Student`, `Owner`, `Admin`).
- **Priorities (`priority1`, `priority2`, `priority3`)**: Student-matching criteria used in compatibility score calculation.

### B. `properties` Table
Houses all off-campus student accommodation listings.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`ownerId` (FK)**: Implicit relationship pointing to `users(id)` representing the listing's landlord.
- **`approvalStatus`**: Flow control attribute (`Pending`, `Approved`, `Rejected`). New properties require admin approval.
- **`amenities`**: Stored as a comma-separated list of selected property characteristics.

### C. `property_images` Table
Holds additional gallery image assets uploaded for rental properties.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`property_id` (FK)**: Cascade-deletable foreign key referencing `properties(id)`.

### D. `property_updates` Table
A historical logging table recording listing modifications. Every edit to an approved listing generates a new row in this table to preserve change logs sequentially.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`propertyId` (FK)**: Relates conceptually to `properties(id)`.

### E. `favorites` Table
Tracks user bookmarking interactions.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`property_id` (FK)**: References `properties(id)`.
- **`userEmail`**: References `users(email)`.

### F. `feedbacks` Table
Captures user comments, feature suggestions, or issue reports.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`userId` (FK)**: References `users(id)`.
- **`category`**: Triage type (`Comment`, `Suggestion`, `Report`).

### G. `password_reset_tokens` Table
Manages secure password recovery tokens.
- **`id` (PK)**: Auto-incremented unique identifier.
- **`user_id` (FK)**: References `users(id)`.
