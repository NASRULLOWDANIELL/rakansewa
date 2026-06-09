# RakanSewa System Sequence Diagram

This document contains the System Sequence Diagram representing the **Housemate Matching and Scoring Flow**, which is a core business operation of the RakanSewa platform.

## System Sequence Diagram: Housemate Matching & Compatibility Scoring

This diagram maps the interactions between the Student user, the React Frontend client, the Spring Boot Backend API, the Matching Service class, and the MySQL Database during matching evaluation.

```mermaid
sequenceDiagram
    autonumber
    actor Student as 👤 Student (User)
    participant UI as 💻 Frontend UI (React App)
    participant API as ⚙️ Backend API (MatchingController)
    participant Service as 🧠 MatchingService (Business Logic)
    participant DB as 🗄️ Database (MySQL)

    Student->>UI: Navigates to "Housemates" Page
    activate UI
    UI->>UI: Retrieve currentUser from AuthContext (e.g. ID = 1)
    UI->>API: GET /matching/user/1
    activate API
    
    API->>Service: matchAllHousemates(userId = 1)
    activate Service

    %% Database queries for current user profile and candidate housemates
    Service->>DB: userRepository.findById(1)
    activate DB
    DB-->>Service: Return User #1 (Target Profile: budget, sleepSchedule, lifestyle)
    deactivate DB

    Service->>DB: userRepository.findByIsListedAsHousemateTrue()
    activate DB
    DB-->>Service: Return List[User] (Active candidate housemates)
    deactivate DB

    %% Scoring evaluation loop
    loop For each Candidate User (excluding current user ID)
        Service->>Service: scoreLifestyle(currentUser, candidate)
        Note over Service: Calculates overlap of comma-separated lifestyles<br/>(Weight: 40% / max 40 points)
        
        Service->>Service: scoreSleepSchedule(currentUser, candidate)
        Note over Service: Compares sleep habits (Exact matches / Flexible)<br/>(Weight: 30% / max 30 points)
        
        Service->>Service: scoreBudget(currentUser, candidate)
        Note over Service: Compares percentage budget difference<br/>(Weight: 30% / max 30 points)
        
        Service->>Service: Round total score & map compatibility label<br/>("Great", "Good", "Fair", or "Low Match")
        
        Service->>Service: MatchingResponseDTO.fromUser(...)
        Note over Service: Factory maps candidate details, score, labels, reasons,<br/>and linkedProperty properties (if any)
    end
    
    Service->>Service: Sort list by compatibilityScore descending (highest match first)
    Service-->>API: Return sorted List[MatchingResponseDTO]
    deactivate Service
    
    API-->>UI: Return JSON payload (200 OK)
    deactivate API

    UI->>Student: Renders housemate listings with compatibility badges & reasons
    deactivate UI
```

## Detailed Interaction Walkthrough

1. **Trigger**: The Student user clicks the "Housemates" navigation menu item on the frontend.
2. **Context Retrieval**: The Frontend application retrieves the current user's authenticated ID from `AuthContext` to contextualize the matching request.
3. **Endpoint Call**: The frontend sends a GET request to `http://localhost:8080/matching/user/{userId}`.
4. **Service Delegation**: `MatchingController` delegates the core logic to `MatchingService.matchAllHousemates(userId)`.
5. **Database Fetching**:
   - `userRepository.findById(userId)` fetches the active user's preference record.
   - `userRepository.findByIsListedAsHousemateTrue()` retrieves all user profiles who opted to list themselves as potential housemates (`isListedAsHousemate = true`).
6. **Matching Evaluation**:
   - The service ignores the user's own profile.
   - Lifestyles are parsed (split by commas) and compared. The matching ratio determines up to **40 points**.
   - Sleep schedules are compared. Same schedules gain **30 points**, while flexible schedules gain **15 points**.
   - Budgets are compared using a percentage difference formula. Very close range earns **30 points**, descending to **10 points** for larger differences.
7. **DTO Generation**: Results are encapsulated into `MatchingResponseDTO` objects, enriching candidate housemate data with their respective matched property details (if linked to a property).
8. **Sorting & Response**: The final list is sorted in descending order (highest score first) and returned as a JSON array to the frontend.
9. **UI Render**: The React page receives the response and renders compatibility cards for each matching housemate.
