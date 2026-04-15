package rakansewa.backend.dto;

import lombok.*;

/**
 * DTO for the matching request body.
 * The frontend sends the user's preferences when requesting housemate matches.
 * This replaces the old questionnaire-based PreferenceProfile approach.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchingRequestDTO {

    // --- Hard Rule Fields ---
    private String gender;              // e.g. "Male", "Female"
    private String preferredGender;     // e.g. "Any", "Male Only", "Female Only"
    private Double maxBudget;           // Maximum budget the user can afford
    private String smokingPreference;   // e.g. "Non-Smoker", "Smoker", "No Preference"

    // --- Soft Rule Fields ---
    private Integer cleanlinessLevel;   // Scale 1–5
    private String sleepSchedule;       // e.g. "Early Bird", "Night Owl", "Flexible"
    private Integer socialLevel;        // Scale 1–5 (1 = very introverted, 5 = very extroverted)
    private String occupationType;      // e.g. "Student", "Working Professional"
    private String guestTolerance;      // e.g. "Rarely", "Sometimes", "Often"
    private String studyNoisePreference;// e.g. "Silent", "Low Noise", "Flexible"
}
