# Multilayer Sequence Diagrams - RakanSewa Use Cases

This document provides the **UML Multilayer Sequence Diagrams** for all 14 use cases of the **RakanSewa** system. Each diagram includes the Actor, Views (`<<View>>`), Controllers (`<<Controller>>`), Domain Entities (`<<Domain>>`), and Data Access/Repositories (`DA: Repository`), including lifelines and detailed messages.

---

## 1. Create Account
Student/Owner creates a new account.

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Owner
    participant LoginPage as <<View>><br/>LoginPage
    participant RegisterPage as <<View>><br/>RegisterPage
    participant AuthController as <<Controller>><br/>AuthController
    participant UserEntity as <<Domain>><br/>User
    participant UserRepository as DA: UserRepository

    User->>LoginPage: Open "Sign Up" page
    LoginPage->>User: Display register page
    User->>RegisterPage: createAccount(name, email, password, matricNumber, uitmEmail)
    RegisterPage->>AuthController: createAccount(name, email, password, matricNumber, uitmEmail)
    AuthController->>UserEntity: createAccount(name, email, password, matricNumber, uitmEmail)
    UserEntity->>UserRepository: INSERT INTO users(name, email, password, matricNumber, uitmEmail)
    UserRepository-->>UserEntity: user record saved
    UserEntity-->>AuthController: return user object
    AuthController-->>RegisterPage: account created successfully
    RegisterPage-->>LoginPage: return confirmation
    LoginPage-->>User: Display login page with success notification
```

---

## 2. View Account
User views their profile details.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant ProfilePage as <<View>><br/>ProfilePage
    participant UserController as <<Controller>><br/>UserController
    participant UserEntity as <<Domain>><br/>User
    participant UserRepository as DA: UserRepository

    User->>ProfilePage: Open "My Profile" tab
    ProfilePage->>UserController: getUser(id)
    UserController->>UserRepository: SELECT * FROM users WHERE id = id
    UserRepository-->>UserController: return user record
    UserController->>UserEntity: mapToUserEntity(record)
    UserEntity-->>ProfilePage: return profile details
    ProfilePage-->>User: Display user details (name, role, status)
```

---

## 3. Update Account
User updates contact profile details.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant ProfilePage as <<View>><br/>ProfilePage
    participant EditProfilePage as <<View>><br/>EditProfilePage
    participant UserController as <<Controller>><br/>UserController
    participant UserEntity as <<Domain>><br/>User
    participant UserRepository as DA: UserRepository

    User->>ProfilePage: Click "Edit Profile"
    ProfilePage->>User: Display edit profile form
    User->>EditProfilePage: updateAccountDetails(name, phoneNumber, allowContact, showWhatsapp)
    EditProfilePage->>UserController: updateProfile(id, name, phoneNumber, allowContact, showWhatsapp)
    UserController->>UserEntity: updateAccount(name, phoneNumber, allowContact, showWhatsapp)
    UserEntity->>UserRepository: UPDATE users SET name, phone, contact_options WHERE id = id
    UserRepository-->>UserEntity: record updated successfully
    UserEntity-->>UserController: return updated user object
    UserController-->>EditProfilePage: profile updated successfully
    EditProfilePage-->>ProfilePage: return confirmation
    ProfilePage-->>User: Display updated profile layout
```

---

## 4. Update Housemate Profile
Student updates matching scheduler priorities.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant ProfilePage as <<View>><br/>ProfilePage
    participant PreferencesPage as <<View>><br/>PreferencesPage
    participant UserController as <<Controller>><br/>UserController
    participant UserEntity as <<Domain>><br/>User
    participant UserRepository as DA: UserRepository

    Student->>ProfilePage: Click "Edit Preferences"
    ProfilePage->>Student: Display preferences layout
    Student->>PreferencesPage: savePreferences(budget, lifestyle, sleepSchedule, priorities)
    PreferencesPage->>UserController: updateProfile(id, preferencesData)
    UserController->>UserEntity: setPreferences(budget, lifestyle, sleepSchedule, priorities)
    UserEntity->>UserRepository: UPDATE users SET budget, lifestyle, priorities WHERE id = id
    UserRepository-->>UserEntity: preferences stored
    UserEntity-->>UserController: return updated user object
    UserController-->>PreferencesPage: preferences updated successfully
    PreferencesPage-->>ProfilePage: return confirmation
    ProfilePage-->>Student: Display updated live preview
```

---

## 5. View Housemates Listing
Student browses housemates compatibility listing.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant HousematesPage as <<View>><br/>HousematesPage
    participant MatchingController as <<Controller>><br/>MatchingController
    participant UserEntity as <<Domain>><br/>User
    participant UserRepository as DA: UserRepository

    Student->>HousematesPage: Click "Find Housemates"
    HousematesPage->>MatchingController: getMatches(userId)
    MatchingController->>UserRepository: SELECT * FROM users WHERE is_listed_as_housemate = true
    UserRepository-->>MatchingController: return list of housemate records
    MatchingController->>UserEntity: calculateCompatibilityScores(currentUser, housemates)
    UserEntity-->>MatchingController: return compatible housemates with scores
    MatchingController-->>HousematesPage: return matches list JSON
    HousematesPage-->>Student: Display compatible housemates grid
```

---

## 6. Filter Properties
Student applies parameters to filter listings.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant PropertiesPage as <<View>><br/>PropertiesPage
    participant PropertyController as <<Controller>><br/>PropertyController
    participant PropertyEntity as <<Domain>><br/>Property
    participant PropertyRepository as DA: PropertyRepository

    Student->>PropertiesPage: Select filters (minPrice, maxPrice, type, room)
    PropertiesPage->>PropertyController: getAllProperties()
    PropertyController->>PropertyRepository: SELECT * FROM properties WHERE approval_status = 'Approved'
    PropertyRepository-->>PropertyController: return approved property records
    PropertyController->>PropertyEntity: applyFilters(records, minPrice, maxPrice, type, room)
    PropertyEntity-->>PropertyController: return filtered properties list
    PropertyController-->>PropertiesPage: return filtered properties JSON
    PropertiesPage-->>Student: Render filtered properties cards
```

---

## 7. Submit Feedback
Student or Owner submits feedback request.

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Owner
    participant FeedbackPage as <<View>><br/>FeedbackPage
    participant FeedbackModal as <<View>><br/>FeedbackModal
    participant FeedbackController as <<Controller>><br/>FeedbackController
    participant FeedbackEntity as <<Domain>><br/>Feedback
    participant FeedbackRepository as DA: FeedbackRepository

    User->>FeedbackPage: Click "Write Feedback"
    FeedbackPage->>User: Display feedback modal overlay
    User->>FeedbackModal: submitFeedback(category, subject, message)
    FeedbackModal->>FeedbackController: submitFeedback(category, subject, message)
    FeedbackController->>FeedbackEntity: createFeedback(userId, category, subject, message)
    FeedbackEntity->>FeedbackRepository: INSERT INTO feedbacks(user_id, category, subject, message, is_resolved)
    FeedbackRepository-->>FeedbackEntity: feedback saved
    FeedbackEntity-->>FeedbackController: return feedback object
    FeedbackController-->>FeedbackModal: feedback submitted successfully
    FeedbackModal-->>FeedbackPage: return confirmation
    FeedbackPage-->>User: Display success alert and update history list
```

---

## 8. Create Property Listing
Owner creates a listing (pending moderation).

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Owner
    participant OwnerDashboard as <<View>><br/>OwnerDashboard
    participant AddPropertyForm as <<View>><br/>AddPropertyForm
    participant PropertyController as <<Controller>><br/>PropertyController
    participant PropertyEntity as <<Domain>><br/>Property
    participant PropertyRepository as DA: PropertyRepository

    Owner->>OwnerDashboard: Click "Create New Listing"
    OwnerDashboard->>Owner: Display add listing form
    Owner->>AddPropertyForm: createProperty(title, rent, address, amenities, images)
    AddPropertyForm->>PropertyController: createProperty(title, rent, address, amenities, images)
    PropertyController->>PropertyEntity: createProperty(ownerId, title, rent, address, amenities)
    PropertyEntity->>PropertyRepository: INSERT INTO properties(owner_id, title, monthly_rent, address, status='Pending')
    PropertyRepository-->>PropertyEntity: property record saved
    PropertyEntity-->>PropertyController: return property object
    PropertyController-->>AddPropertyForm: listing created successfully (pending review)
    AddPropertyForm-->>OwnerDashboard: return confirmation
    OwnerDashboard-->>Owner: Display listings list with new pending card
```

---

## 9. View Property Listing
User views listing details.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Student/Owner)
    participant PropertiesPage as <<View>><br/>PropertiesPage
    participant PropertyDetailsPage as <<View>><br/>PropertyDetailsPage
    participant PropertyController as <<Controller>><br/>PropertyController
    participant PropertyEntity as <<Domain>><br/>Property
    participant PropertyRepository as DA: PropertyRepository

    User->>PropertiesPage: Click property card
    PropertiesPage->>User: Redirect to details view
    PropertyDetailsPage->>PropertyController: getProperty(id)
    PropertyController->>PropertyRepository: SELECT * FROM properties WHERE id = id
    PropertyRepository-->>PropertyController: return property record
    PropertyController->>PropertyEntity: mapToPropertyEntity(record)
    PropertyEntity-->>PropertyDetailsPage: return property details
    PropertyDetailsPage-->>User: Display property details, location, map, and amenities
```

---

## 10. Update Property Listing
Owner modifies details of their listed property.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Owner
    participant OwnerDashboard as <<View>><br/>OwnerDashboard
    participant EditPropertyForm as <<View>><br/>EditPropertyForm
    participant PropertyController as <<Controller>><br/>PropertyController
    participant PropertyEntity as <<Domain>><br/>Property
    participant PropertyRepository as DA: PropertyRepository

    Owner->>OwnerDashboard: Click "Edit" on listing
    OwnerDashboard->>Owner: Display edit listing form
    Owner->>EditPropertyForm: updatePropertyDetails(rent, availabilityStatus, etc.)
    EditPropertyForm->>PropertyController: updateProperty(id, rent, availabilityStatus, etc.)
    PropertyController->>PropertyEntity: updateProperty(rent, availabilityStatus)
    PropertyEntity->>PropertyRepository: UPDATE properties SET monthly_rent, availability WHERE id = id
    PropertyRepository-->>PropertyEntity: property record updated
    PropertyEntity-->>PropertyController: return updated property
    PropertyController-->>EditPropertyForm: property updated successfully
    EditPropertyForm-->>OwnerDashboard: return confirmation
    OwnerDashboard-->>Owner: Display listings list with updated properties
```

---

## 11. Delete Property Listing
Owner deletes listing from their catalog.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Owner
    participant OwnerDashboard as <<View>><br/>OwnerDashboard
    participant PropertyController as <<Controller>><br/>PropertyController
    participant PropertyEntity as <<Domain>><br/>Property
    participant PropertyRepository as DA: PropertyRepository

    Owner->>OwnerDashboard: Click "Delete" and confirm
    OwnerDashboard->>PropertyController: deleteProperty(id)
    PropertyController->>PropertyRepository: DELETE FROM properties WHERE id = id
    PropertyRepository-->>PropertyController: deletion confirmation
    PropertyController-->>OwnerDashboard: property deleted successfully
    OwnerDashboard-->>Owner: Remove property card from display
```

---

## 12. Verify Property Listing
Admin approves or rejects a property listing.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant AdminDashboard as <<View>><br/>AdminDashboard
    participant AdminPropertyController as <<Controller>><br/>AdminPropertyController
    participant PropertyEntity as <<Domain>><br/>Property
    participant PropertyRepository as DA: PropertyRepository

    Admin->>AdminDashboard: Click "Approve" or "Reject"
    AdminDashboard->>AdminPropertyController: approveProperty(id) or rejectProperty(id, reason)
    AdminPropertyController->>PropertyEntity: setApprovalStatus('Approved') or setApprovalStatus('Rejected')
    PropertyEntity->>PropertyRepository: UPDATE properties SET approval_status, rejection_reason WHERE id = id
    PropertyRepository-->>PropertyEntity: property updated
    PropertyEntity-->>AdminPropertyController: return updated property
    AdminPropertyController-->>AdminDashboard: property verified successfully
    AdminDashboard-->>Admin: Refresh pending approvals list
```

---

## 13. View Feedbacks
Admin retrieves all submitted feedbacks.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant AdminDashboard as <<View>><br/>AdminDashboard
    participant FeedbackController as <<Controller>><br/>FeedbackController
    participant FeedbackEntity as <<Domain>><br/>Feedback
    participant FeedbackRepository as DA: FeedbackRepository

    Admin->>AdminDashboard: Open "User Feedback" tab
    AdminDashboard->>FeedbackController: getAllFeedbacks()
    FeedbackController->>FeedbackRepository: SELECT * FROM feedbacks
    FeedbackRepository-->>FeedbackController: return list of feedback records
    FeedbackController->>FeedbackEntity: mapToFeedbackEntities(records)
    FeedbackEntity-->>AdminDashboard: return feedbacks list
    AdminDashboard-->>Admin: Display feedbacks table list
```

---

## 14. Approve Feedback (Resolve Feedback)
Admin flags unresolved feedback cases as resolved.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant AdminDashboard as <<View>><br/>AdminDashboard
    participant FeedbackController as <<Controller>><br/>FeedbackController
    participant FeedbackEntity as <<Domain>><br/>Feedback
    participant FeedbackRepository as DA: FeedbackRepository

    Admin->>AdminDashboard: Click "Mark Resolved" on feedback row
    AdminDashboard->>FeedbackController: resolveFeedback(id)
    FeedbackController->>FeedbackEntity: setIsResolved(true)
    FeedbackEntity->>FeedbackRepository: UPDATE feedbacks SET is_resolved = true WHERE id = id
    FeedbackRepository-->>FeedbackEntity: record updated
    FeedbackEntity-->>FeedbackController: return resolved feedback
    FeedbackController-->>AdminDashboard: feedback resolved successfully
    AdminDashboard-->>Admin: Refresh feedbacks list table
```
