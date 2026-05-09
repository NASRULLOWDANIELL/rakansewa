package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "housemate_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HousemateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long userId;

    @Column
    private String name;

    @Column
    private String gender;

    @Column
    private Integer age;

    @Column
    private Double budget;

    @Column
    private String occupationType; // e.g. "Student", "Working Professional"

    @Column
    private String cleanlinessLevel; // e.g. "Very Strict", "Strict", "Moderate", "Flexible", "Very Flexible"

    @Column
    private String sleepSchedule; // e.g. "Early Bird", "Night Owl", "Flexible"

    @Column
    private String preferredGender; // e.g. "Any", "Male Only", "Female Only"

    @Column
    private String smokingPreference; // e.g. "Non-Smoker", "Smoker", "No Preference"

    @Column
    private Integer socialLevel; // Scale 1–5 (1 = very introverted, 5 = very extroverted)

    @Column
    private String guestTolerance; // e.g. "Rarely", "Sometimes", "Often"

    @Column
    private String studyNoisePreference; // e.g. "Silent", "Low Noise", "Flexible"

    @Column(columnDefinition = "TEXT")
    private String description;

    // Many profiles can belong to one property (now nullable for housemates without a linked property)
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Property property;
}
