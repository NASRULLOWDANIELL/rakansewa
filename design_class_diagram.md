# Design Class Diagram - RakanSewa

Below is the **Design Class Diagram** for the **RakanSewa** system. It shows the architecture layout, mapping the frontend Views (`<<View>>`), backend REST Controllers (`<<Controller>>`), and persistence domain Entities, along with their association methods and calling relationships.

## 1. Mermaid Class Diagram

```mermaid
classDiagram
    %% --- VIEWS ---
    class LoginPage {
        <<View>>
        +email
        +password
        +handleLogin()
    }
    class RegisterPage {
        <<View>>
        +name
        +email
        +password
        +role
        +handleRegister()
    }
    class PropertyDetailsPage {
        <<View>>
        +propertyId
        +displayDetails()
    }
    class OwnerDashboardPage {
        <<View>>
        +ownerProperties
        +handleAddListing()
        +handleEditListing()
    }
    class AdminDashboardPage {
        <<View>>
        +pendingApprovals
        +handleApprove()
        +handleReject()
    }
    class FeedbackPage {
        <<View>>
        +feedbackList
        +handleSubmitFeedback()
    }
    class HousemateMatchingPage {
        <<View>>
        +matchesList
        +viewMatchDetails()
    }

    %% --- CONTROLLERS ---
    class AuthController {
        <<Controller>>
        +registerUser(dto)
        +loginUser(dto)
        +verifyEmail(token)
        +forgotPassword(email)
        +resetPassword(token, password)
    }
    class PropertyController {
        <<Controller>>
        +createProperty(property, images)
        +updateProperty(id, property)
        +deleteProperty(id)
        +getProperty(id)
        +getAllProperties()
        +getOwnerProperties(ownerId)
    }
    class AdminPropertyController {
        <<Controller>>
        +getPendingProperties()
        +approveProperty(id)
        +rejectProperty(id, reason)
    }
    class FeedbackController {
        <<Controller>>
        +submitFeedback(feedback)
        +getAllFeedbacks()
        +resolveFeedback(id)
    }
    class FavoriteController {
        <<Controller>>
        +toggleFavorite(propertyId, userEmail)
        +getUserFavorites(userEmail)
        +isFavorite(propertyId, userEmail)
    }
    class UserController {
        <<Controller>>
        +getUser(id)
        +updateProfile(id, userDto)
        +getAllUsers()
    }
    class MatchingController {
        <<Controller>>
        +getMatches(userId)
    }

    %% --- ENTITIES ---
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
        +Boolean allowContact
        +Boolean showWhatsapp
        +String matricNumber
        +String uitmEmail
        +Boolean isStudentVerified
        +Boolean emailVerified
        +String emailVerificationToken
        +LocalDateTime emailVerificationTokenExpiry
        +String authProvider
        +String priority1
        +String priority2
        +String priority3
        +String profileImageUrl
        +Long linked_property_id
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
        +Double latitude
        +Double longitude
        +String approvalStatus
        +String rejectionReason
        +String amenities
        +LocalDateTime updatedAt
        +String changeLog
    }

    class PropertyImage {
        +Long id
        +Long property_id
        +String imageUrl
        +LocalDateTime createdAt
    }

    class PropertyUpdate {
        +Long id
        +Long propertyId
        +String title
        +String imageUrl
        +String city
        +String state
        +String changeLog
        +LocalDateTime updatedAt
    }

    class Favorite {
        +Long id
        +String userEmail
        +Long property_id
    }

    class Feedback {
        +Long id
        +Long userId
        +String category
        +String subject
        +String message
        +LocalDateTime createdAt
        +Boolean isResolved
    }

    class PasswordResetToken {
        +Long id
        +String token
        +Long user_id
        +LocalDateTime expiresAt
        +Boolean used
        +LocalDateTime createdAt
    }

    %% --- VIEW TO CONTROLLER RELATIONSHIPS ---
    LoginPage ..> AuthController : Calls
    RegisterPage ..> AuthController : Calls
    PropertyDetailsPage ..> PropertyController : Calls
    PropertyDetailsPage ..> FavoriteController : Calls
    OwnerDashboardPage ..> PropertyController : Calls
    AdminDashboardPage ..> AdminPropertyController : Calls
    AdminDashboardPage ..> FeedbackController : Calls
    FeedbackPage ..> FeedbackController : Calls
    HousemateMatchingPage ..> MatchingController : Calls

    %% --- CONTROLLER TO ENTITY RELATIONSHIPS ---
    AuthController ..> User : Manages
    AuthController ..> PasswordResetToken : Manages
    PropertyController ..> Property : Manages
    PropertyController ..> PropertyImage : Manages
    AdminPropertyController ..> Property : Approves
    AdminPropertyController ..> PropertyUpdate : Logs
    FeedbackController ..> Feedback : Resolves
    FavoriteController ..> Favorite : Toggles
    UserController ..> User : Modifies
    MatchingController ..> User : Matches

    %% --- ENTITY TO ENTITY RELATIONSHIPS ---
    User "1" --> "0..1" Property : "has linked property"
    User "1" --> "0..n" Property : "owns (as Owner)"
    Property "1" --> "0..n" PropertyImage : "contains"
    Property "1" --> "0..n" PropertyUpdate : "has logs"
    User "1" --> "0..n" Favorite : "marks"
    Property "1" --> "0..n" Favorite : "is favorited"
    User "1" --> "0..n" Feedback : "submits"
    User "1" --> "0..n" PasswordResetToken : "requests reset"
```

---

## 2. Structural Layer Descriptions

### A. View Layer (`<<View>>`)
These classes represent the user interface pages built with React and Tailwind CSS. They contain page states and handle user inputs (e.g., `handleLogin()`), then invoke Controller REST endpoints asynchronously via HTTP requests.

### B. Controller Layer (`<<Controller>>`)
These classes represent the Spring Boot `RestController` backend API mappings. They expose endpoints (e.g., `/api/properties`, `/api/auth`) and call Service/Repository components to execute operations on database entities.

### C. Domain Entity Layer
The persistent entity beans mapped to physical H2 database tables. They hold data columns, PK/FK attributes, and represent the system's core data models.
