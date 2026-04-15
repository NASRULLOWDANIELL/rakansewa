package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "housemate_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HousemateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private Double budget;

    @Column(nullable = false)
    private String occupationType; // e.g. "Student", "Working Professional"

    @Column(nullable = false)
    private String cleanlinessLevel; // e.g. "Very Strict", "Strict", "Moderate", "Flexible", "Very Flexible"

    @Column(nullable = false)
    private String sleepSchedule; // e.g. "Early Bird", "Night Owl", "Flexible"

    @Column(nullable = false)
    private String preferredGender; // e.g. "Any", "Male Only", "Female Only"

    @Column(nullable = false)
    private String smokingPreference; // e.g. "Non-Smoker", "Smoker", "No Preference"

    @Column
    private Integer socialLevel; // Scale 1–5 (1 = very introverted, 5 = very extroverted)

    @Column
    private String guestTolerance; // e.g. "Rarely", "Sometimes", "Often"

    @Column
    private String studyNoisePreference; // e.g. "Silent", "Low Noise", "Flexible"

    @Column(columnDefinition = "TEXT")
    private String description;

    // Many profiles can belong to one property
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
}
