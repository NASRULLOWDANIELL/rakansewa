package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column
    private Boolean isListedAsHousemate;

    @Column
    private Double budget;

    @Column
    private String lifestyle;

    @Column
    private String sleepSchedule;

    @Column
    private String phoneNumber;

    @Column
    private String matricNumber;

    @Column
    private String uitmEmail;

    @Column(columnDefinition = "boolean default false")
    private Boolean isStudentVerified = false;

    @Column(columnDefinition = "boolean default false")
    private Boolean emailVerified = false;

    @Column
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String emailVerificationToken;

    @Column
    private LocalDateTime emailVerificationTokenExpiry;

    @Column
    private String authProvider;

    // Linked rental property (nullable — housemate may not be linked to any property)
    @ManyToOne
    @JoinColumn(name = "linked_property_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Property linkedProperty;
}
