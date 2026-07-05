# Detailed Class Diagrams - RakanSewa Use Cases

This document provides the **UML Detailed Class Diagrams** for the remaining 13 use cases of the **RakanSewa** system. Each diagram includes View (`<<View>>`), Controller (`<<Controller>>`), Entity (`<<Entity>>`), and Repository/DAO (`<<DAO>>`) classes, including operations, fields, and dependencies.

---

## Use Case 1: View Account
Student, Owner, or Admin loads their user profile details.

```mermaid
classDiagram
    class ViewAccount {
        <<View>>
        +userId: Long
        +profileData: Object
        +loadProfile(): void
    }
    class UserController {
        <<Controller>>
        +getUser(id: Long): ResponseEntity
    }
    class User {
        <<Entity>>
        -id: Long
        -name: String
        -email: String
        -role: String
        -phoneNumber: String
        +getId(): Long
        +getName(): String
        +getEmail(): String
        +getRole(): String
    }
    class UserRepository {
        <<DAO>>
        +findById(id: Long): Optional
    }
    ViewAccount --> UserController : Calls
    UserController --> User : Retrieves
    User --> UserRepository : Queries
```

---

## Use Case 2: Update Account
User updates their primary contact details and visibility preferences.

```mermaid
classDiagram
    class UpdateAccount {
        <<View>>
        +name: String
        +phoneNumber: String
        +allowContact: Boolean
        +showWhatsapp: Boolean
        +handleUpdateSubmit(): void
    }
    class UserController {
        <<Controller>>
        +updateProfile(id: Long, dto: UserDto): ResponseEntity
    }
    class User {
        <<Entity>>
        -id: Long
        -name: String
        -phoneNumber: String
        -allowContact: Boolean
        -showWhatsapp: Boolean
        +setName(name: String): void
        +setPhoneNumber(num: String): void
        +setAllowContact(b: Boolean): void
        +setShowWhatsapp(b: Boolean): void
    }
    class UserRepository {
        <<DAO>>
        +save(user: User): User
    }
    UpdateAccount --> UserController : Calls
    UserController --> User : Modifies
    User --> UserRepository : Persists
```

---

## Use Case 3: Update Housemate Profile
Student sets compatibility budget, schedules, and matching priority rankings.

```mermaid
classDiagram
    class UpdateHousemateProfile {
        <<View>>
        +isListedAsHousemate: Boolean
        +budget: Double
        +lifestyle: String
        +sleepSchedule: String
        +priority1: String
        +priority2: String
        +priority3: String
        +handlePreferencesSave(): void
    }
    class UserController {
        <<Controller>>
        +updateProfile(id: Long, dto: UserDto): ResponseEntity
    }
    class User {
        <<Entity>>
        -isListedAsHousemate: Boolean
        -budget: Double
        -lifestyle: String
        -sleepSchedule: String
        -priority1: String
        -priority2: String
        -priority3: String
        +setIsListedAsHousemate(b: Boolean): void
        +setBudget(d: Double): void
        +setLifestyle(s: String): void
        +setSleepSchedule(s: String): void
        +setPriority1(s: String): void
        +setPriority2(s: String): void
        +setPriority3(s: String): void
    }
    class UserRepository {
        <<DAO>>
        +save(user: User): User
    }
    UpdateHousemateProfile --> UserController : Calls
    UserController --> User : Modifies
    User --> UserRepository : Persists
```

---

## Use Case 4: View Housemates Listing
Student browses matches and views calculated compatibility scores.

```mermaid
classDiagram
    class ViewHousematesListing {
        <<View>>
        +housematesList: List
        +fetchHousemates(): void
    }
    class MatchingController {
        <<Controller>>
        +getMatches(userId: Long): ResponseEntity
    }
    class User {
        <<Entity>>
        -id: Long
        -isListedAsHousemate: Boolean
        -priority1: String
        -priority2: String
        -priority3: String
        +getIsListedAsHousemate(): Boolean
        +getPriority1(): String
        +getPriority2(): String
        +getPriority3(): String
    }
    class UserRepository {
        <<DAO>>
        +findByIsListedAsHousemateTrue(): List
    }
    ViewHousematesListing --> MatchingController : Calls
    MatchingController --> User : Resolves
    User --> UserRepository : Queries
```

---

## Use Case 5: Filter Properties
Student applies query filters (price, room type, property type) to listings.

```mermaid
classDiagram
    class FilterProperties {
        <<View>>
        +minPrice: Double
        +maxPrice: Double
        +roomType: String
        +propertyType: String
        +handleFilterSubmit(): void
    }
    class PropertyController {
        <<Controller>>
        +getAllProperties(): ResponseEntity
    }
    class Property {
        <<Entity>>
        -id: Long
        -monthlyRent: Double
        -roomType: String
        -propertyType: String
        -approvalStatus: String
        +getMonthlyRent(): Double
        +getRoomType(): String
        +getPropertyType(): String
        +getApprovalStatus(): String
    }
    class PropertyRepository {
        <<DAO>>
        +findByApprovalStatus(status: String): List
    }
    FilterProperties --> PropertyController : Calls
    PropertyController --> Property : Filters
    Property --> PropertyRepository : Queries
```

---

## Use Case 6: Submit Feedback
Student or Owner drafts and uploads feedback comments, suggestions, or reports.

```mermaid
classDiagram
    class SubmitFeedback {
        <<View>>
        +category: String
        +subject: String
        +message: String
        +handleSubmitFeedback(): void
    }
    class FeedbackController {
        <<Controller>>
        +submitFeedback(feedback: Feedback): ResponseEntity
    }
    class Feedback {
        <<Entity>>
        -id: Long
        -userId: Long
        -category: String
        -subject: String
        -message: String
        +setUserId(id: Long): void
        +setCategory(c: String): void
        +setSubject(s: String): void
        +setMessage(m: String): void
    }
    class FeedbackRepository {
        <<DAO>>
        +save(feedback: Feedback): Feedback
    }
    SubmitFeedback --> FeedbackController : Calls
    FeedbackController --> Feedback : Creates
    Feedback --> FeedbackRepository : Persists
```

---

## Use Case 7: Create Property Listing
Owner uploads description, rent pricing, and parameters to list their rental.

```mermaid
classDiagram
    class CreatePropertyListing {
        <<View>>
        +title: String
        +address: String
        +monthlyRent: Double
        +roomType: String
        +propertyType: String
        +handleCreateSubmit(): void
    }
    class PropertyController {
        <<Controller>>
        +createProperty(property: Property, files: MultipartFile[]): ResponseEntity
    }
    class Property {
        <<Entity>>
        -title: String
        -address: String
        -monthlyRent: Double
        -roomType: String
        -propertyType: String
        -approvalStatus: String
        +setTitle(s: String): void
        +setAddress(s: String): void
        +setMonthlyRent(d: Double): void
        +setRoomType(s: String): void
        +setPropertyType(s: String): void
        +setApprovalStatus(s: String): void
    }
    class PropertyRepository {
        <<DAO>>
        +save(property: Property): Property
    }
    CreatePropertyListing --> PropertyController : Calls
    PropertyController --> Property : Creates
    Property --> PropertyRepository : Persists
```

---

## Use Case 8: View Property Listing
Student or Owner reads detail parameters, location distance, and gallery updates.

```mermaid
classDiagram
    class ViewPropertyListing {
        <<View>>
        +propertyId: Long
        +loadPropertyDetails(): void
    }
    class PropertyController {
        <<Controller>>
        +getProperty(id: Long): ResponseEntity
    }
    class Property {
        <<Entity>>
        -id: Long
        -title: String
        -address: String
        -monthlyRent: Double
        +getTitle(): String
        +getAddress(): String
        +getMonthlyRent(): Double
    }
    class PropertyRepository {
        <<DAO>>
        +findById(id: Long): Optional
    }
    ViewPropertyListing --> PropertyController : Calls
    PropertyController --> Property : Retrieves
    Property --> PropertyRepository : Queries
```

---

## Use Case 9: Update Property Listing
Owner modifies parameters of their accommodation and registers changes.

```mermaid
classDiagram
    class UpdatePropertyListing {
        <<View>>
        +propertyId: Long
        +title: String
        +monthlyRent: Double
        +handleUpdateSubmit(): void
    }
    class PropertyController {
        <<Controller>>
        +updateProperty(id: Long, p: Property): ResponseEntity
    }
    class Property {
        <<Entity>>
        -id: Long
        -title: String
        -monthlyRent: Double
        -changeLog: String
        +setTitle(s: String): void
        +setMonthlyRent(d: Double): void
        +setChangeLog(s: String): void
    }
    class PropertyRepository {
        <<DAO>>
        +save(property: Property): Property
    }
    UpdatePropertyListing --> PropertyController : Calls
    PropertyController --> Property : Modifies
    Property --> PropertyRepository : Persists
```

---

## Use Case 10: Delete Property Listing
Owner removes their off-campus listing permanently from the system.

```mermaid
classDiagram
    class DeletePropertyListing {
        <<View>>
        +propertyId: Long
        +handleDeleteClick(): void
    }
    class PropertyController {
        <<Controller>>
        +deleteProperty(id: Long): ResponseEntity
    }
    class Property {
        <<Entity>>
        -id: Long
        +getId(): Long
    }
    class PropertyRepository {
        <<DAO>>
        +deleteById(id: Long): void
    }
    DeletePropertyListing --> PropertyController : Calls
    PropertyController --> Property : Resolves
    Property --> PropertyRepository : Deletes
```

---

## Use Case 11: Verify Property Listing
Admin reviews, rejects (with reasons), or approves pending rental listings.

```mermaid
classDiagram
    class VerifyPropertyListing {
        <<View>>
        +propertyId: Long
        +reason: String
        +handleApprove(): void
        +handleReject(): void
    }
    class AdminPropertyController {
        <<Controller>>
        +approveProperty(id: Long): ResponseEntity
        +rejectProperty(id: Long, reason: String): ResponseEntity
    }
    class Property {
        <<Entity>>
        -id: Long
        -approvalStatus: String
        -rejectionReason: String
        +setApprovalStatus(s: String): void
        +setRejectionReason(s: String): void
    }
    class PropertyRepository {
        <<DAO>>
        +save(property: Property): Property
    }
    VerifyPropertyListing --> AdminPropertyController : Calls
    AdminPropertyController --> Property : Moderates
    Property --> PropertyRepository : Persists
```

---

## Use Case 12: View Feedbacks
Admin views unresolved or categorized feedback logs in the system.

```mermaid
classDiagram
    class ViewFeedbacks {
        <<View>>
        +feedbacksList: List
        +loadFeedbacks(): void
    }
    class FeedbackController {
        <<Controller>>
        +getAllFeedbacks(): ResponseEntity
    }
    class Feedback {
        <<Entity>>
        -id: Long
        -category: String
        -subject: String
        -isResolved: Boolean
        +getCategory(): String
        +getSubject(): String
        +getIsResolved(): Boolean
    }
    class FeedbackRepository {
        <<DAO>>
        +findAll(): List
    }
    ViewFeedbacks --> FeedbackController : Calls
    FeedbackController --> Feedback : Retrieves
    Feedback --> FeedbackRepository : Queries
```

---

## Use Case 13: Approve Feedback (Resolve Feedback)
Admin flags unresolved feedback cases as resolved.

```mermaid
classDiagram
    class ApproveFeedback {
        <<View>>
        +feedbackId: Long
        +handleResolveClick(): void
    }
    class FeedbackController {
        <<Controller>>
        +resolveFeedback(id: Long): ResponseEntity
    }
    class Feedback {
        <<Entity>>
        -id: Long
        -isResolved: Boolean
        +setIsResolved(b: Boolean): void
    }
    class FeedbackRepository {
        <<DAO>>
        +save(feedback: Feedback): Feedback
    }
    ApproveFeedback --> FeedbackController : Calls
    FeedbackController --> Feedback : Resolves
    Feedback --> FeedbackRepository : Persists
```
