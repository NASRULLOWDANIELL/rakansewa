# RakanSewa Business Activity Diagrams

This document contains two main business activity flows representing the real business processes implemented in the RakanSewa system.

---

## 1. Property Listing Approval Lifecycle

This activity diagram shows the workflow from property registration by a Landlord/Owner to verification by the Admin, including correction and resubmission paths.

```mermaid
graph TD
    %% Define States / Activities
    Start([Start]) --> Login[Owner Logs In]
    Login --> VerifyProfile{Is Profile Verified?}
    
    %% Profile Verification Check
    VerifyProfile -- No --> OpenProfile[Redirect to Profile Page / Complete Verification]
    OpenProfile --> SubmitVerification[Submit Matric & UiTM Email]
    SubmitVerification --> UpdateVerificationStatus[System Performs Auto-Verification]
    UpdateVerificationStatus --> VerifyProfile
    
    VerifyProfile -- Yes --> CreateListing[Fill & Submit Property Form]
    CreateListing --> UploadImg{Upload Image?}
    
    UploadImg -- Yes --> CallUploadAPI[Upload File via FileUploadController]
    CallUploadAPI --> SavePending[Save Property as PENDING & Pending Approval]
    UploadImg -- No --> SavePending
    
    %% Admin Queue
    SavePending --> AdminQueue[Appears on Admin Dashboard Approval Queue]
    AdminQueue --> AdminReview[Admin Reviews Listing Information]
    AdminReview --> AdminDecision{Admin Decision}
    
    %% Admin Decision Path
    AdminDecision -- Approve --> ApproveListing[Set Status to APPROVED & Available]
    ApproveListing --> PublishListing[Listing Becomes Visible on Properties Page]
    PublishListing --> EndApprove([End - Published])
    
    AdminDecision -- Reject --> RejectListing[Set Status to REJECTED & Rejected]
    RejectListing --> RecordReason[Save Rejection Reason in Database]
    RecordReason --> NotifyOwner[Display Rejection Reason on Owner Dashboard]
    
    %% Correction path
    NotifyOwner --> OwnerEdit[Owner Clicks Edit & Resubmit]
    OwnerEdit --> EditFields[Modify Listing Fields / Fix Rejected Info]
    EditFields --> ResubmitListing[Resubmit Property via Resubmit Endpoint]
    ResubmitListing --> ResetStatus[Reset Status to PENDING and Clear Rejection Reason]
    ResetStatus --> AdminQueue
```

---

## 2. UiTM Student Verification & Housemate Matching Flow

This activity diagram describes the automated verification of Student status and how it feeds into the Housemate Listing, Matching Compatibility check, and Rental Booking requests.

```mermaid
graph TD
    StartStudent([Start]) --> StudentRegister[Register Student Account]
    StudentRegister --> EnterUitmCredentials[Enter Matric Number & UiTM Student Email]
    
    %% Automated Validation Logic
    EnterUitmCredentials --> CheckDomain{Does email end with<br/>@student.uitm.edu.my?}
    
    CheckDomain -- No --> ValidationFail[Throw Exception: Invalid Domain]
    ValidationFail --> EnterUitmCredentials
    
    CheckDomain -- Yes --> CheckMatricPrefix{Does Matric Number<br/>equal email prefix username?}
    
    CheckMatricPrefix -- No --> MatricFail[Throw Exception: Matric and Email Prefix Mismatch]
    MatricFail --> EnterUitmCredentials
    
    CheckMatricPrefix -- Yes --> AutoVerify[Set isStudentVerified = true]
    
    %% Verified Activities
    AutoVerify --> VerifiedUser{Choose Action}
    
    %% Action Path A: Housemate Profile Listing
    VerifiedUser -->|Setup Housemate Profile| EditMatchingPrefs[Set Budget, Sleep Schedule, & Lifestyles]
    EditMatchingPrefs --> ToggleHousemate[Set isListedAsHousemate = true]
    ToggleHousemate --> RenderMatching[Query Matching Algorithm via /matching/user/id]
    RenderMatching --> ComputeScores[Calculate Compatibility Scores]
    ComputeScores --> DisplayMatches[Display Sorted Compatibility Lists & Reasons]
    DisplayMatches --> EndStudent([End])

    %% Action Path B: Property Browsing & Favorites
    VerifiedUser -->|Browse Properties| ViewProperties[Filter Listings by Room Type, Rent, furnishedStatus]
    ViewProperties --> ChooseProperty[Select Specific Property Listing]
    ChooseProperty --> ToggleFav[Toggle Favorite status via FavoriteController]
    ToggleFav --> ViewProperties
    ViewProperties --> EndStudent
```
