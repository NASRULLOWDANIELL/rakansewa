# Create Account Use Case Detail Class Diagram

Below is the **Detail Class Diagram** specifically for the **Create Account** use case of the **RakanSewa** system. It models the attributes, operations, and stereotype boundaries of the MVC architectural flow.

## 1. Mermaid Class Diagram

```mermaid
classDiagram
    class CreateAccount {
        <<View>>
        +name: String
        +email: String
        +password: String
        +role: String
        +matricNumber: String
        +uitmEmail: String
        +handleSubmit(): void
        +handleInputChange(): void
    }

    class AuthController {
        <<Controller>>
        +registerUser(dto: RegisterRequest): ResponseEntity
    }

    class User {
        <<Entity>>
        -id: Long
        -name: String
        -email: String
        -password: String
        -role: String
        -matricNumber: String
        -uitmEmail: String
        -isStudentVerified: Boolean
        +getName(): String
        +setName(name: String): void
        +getEmail(): String
        +setEmail(email: String): void
        +getPassword(): String
        +setPassword(password: String): void
        +getRole(): String
        +setRole(role: String): void
        +getMatricNumber(): String
        +setMatricNumber(matricNumber: String): void
        +getUitmEmail(): String
        +setUitmEmail(uitmEmail: String): void
    }

    class UserRepository {
        <<DAO>>
        +save(user: User): User
        +findByEmail(email: String): Optional
        +existsByEmail(email: String): Boolean
    }

    CreateAccount --> AuthController : Calls
    AuthController --> User : Creates
    User --> UserRepository : Persists
```

---

## 2. Interaction Descriptions

1. **`CreateAccount` (View)**: The registration screen collects student/owner input details (Name, Email, Password, Matric Number, and UiTM email) and triggers `handleSubmit()` to send an HTTP POST request to the API controller.
2. **`AuthController` (Controller)**: Receives the POST payload, validates the inputs, handles registration criteria, and instantiates a new `User` entity.
3. **`User` (Entity)**: Holds the state of the registered account attributes.
4. **`UserRepository` (DAO)**: Persists the newly created user object into the database through Spring Data JPA's `.save(user)` query.
