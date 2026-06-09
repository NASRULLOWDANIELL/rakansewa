# RakanSewa Domain Class Diagram

This document contains the class diagram for the backend entities, enumerations, DTOs, and their relationships based directly on the Spring Boot database models.

## Domain Class Diagram

```mermaid
classDiagram
    %% Entities
    class User {
        +Long id
        +String name
        +String email
        +String password
        +String role
        +Boolean isListedAsHousemate
        +Double budget
        +String lifestyle
        +String sleepSchedule
        +String phoneNumber
        +String matricNumber
        +String uitmEmail
        +Boolean isStudentVerified
        +Boolean emailVerified
        +String emailVerificationToken
        +LocalDateTime emailVerificationTokenExpiry
        +String authProvider
        +Property linkedProperty
    }

    class Property {
        +Long id
        +String title
        +String description
        +String address
        +String city
        +String state
        +Double monthlyRent
        +String roomType
        +String propertyType
        +String furnishedStatus
        +String availabilityStatus
        +Long ownerId
        +String imageUrl
        +VerificationStatus verificationStatus
        +Double latitude
        +Double longitude
        +String approvalStatus
        +String rejectionReason
    }

    class Favorite {
        +Long id
        +String userEmail
        +Property property
    }

    class Feedback {
        +Long id
        +Long userId
        +String category
        +String subject
        +String message
        +LocalDateTime createdAt
        +Boolean isResolved
        +String userName
    }

    class PasswordResetToken {
        +Long id
        +String token
        +User user
        +LocalDateTime expiresAt
        +Boolean used
        +LocalDateTime createdAt
        +onCreate() void
        +isExpired() boolean
    }

    class RentalRequest {
        +Long id
        +String studentName
        +String studentEmail
        +String message
        +String requestStatus
        +LocalDateTime requestDate
        +Property property
        +prePersist() void
    }

    %% Enumerations
    class VerificationStatus {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
    }

    %% Data Transfer Objects
    class MatchingResponseDTO {
        +Long userId
        +String housemateName
        +Double budget
        +String sleepSchedule
        +String lifestyle
        +Long propertyId
        +String propertyTitle
        +String propertyAddress
        +String propertyCity
        +String propertyState
        +double compatibilityScore
        +String compatibilityLabel
        +List~String~ matchedReasons
        +fromUser(User user, double score, String label, List~String~ reasons) MatchingResponseDTO$
    }

    %% Relationships and Multiplicities
    Property --> VerificationStatus : uses
    User "0..*" --> "0..1" Property : linkedProperty
    Favorite "0..*" --> "1" Property : property
    PasswordResetToken "0..*" --> "1" User : user
    RentalRequest "0..*" --> "1" Property : property

    %% DTO Dependency (Indicates instantiation mapping)
    MatchingResponseDTO ..> User : constructs from
    MatchingResponseDTO ..> Property : constructs from
```

## Relationships Details

1. **User and Property (`linkedProperty`)**: A user (Student) can be linked to zero or one Property. A single Property can have multiple linked Users (housemates). This is mapped as a `@ManyToOne` association in `User.java`.
2. **Favorite and Property**: Many favorites can point to a single Property. A Favorite is identified by the user's email (`userEmail` as a field) and holds a `@ManyToOne` reference to `Property.java`.
3. **RentalRequest and Property**: A Property can receive multiple rental applications. Each `RentalRequest` is linked to exactly one `Property` via a `@ManyToOne` reference.
4. **PasswordResetToken and User**: Each reset token is associated with exactly one `User` via a `@ManyToOne` reference.
5. **Property and VerificationStatus**: Property has a field `verificationStatus` which is an Enum indicating whether the listing is `PENDING`, `APPROVED`, or `REJECTED`.
