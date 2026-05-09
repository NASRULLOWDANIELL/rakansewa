package rakansewa.backend.dto;

import lombok.*;
import rakansewa.backend.model.HousemateProfile;

import java.util.List;

/**
 * DTO for the matching response.
 * Contains the housemate info, compatibility score, match label,
 * and human-readable reasons why they matched.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingResponseDTO {

    private Long housemateId;
    private Long userId;
    private String housemateName;
    private String gender;
    private Integer age;
    private Double budget;
    private String occupationType;
    private String cleanlinessLevel;
    private String sleepSchedule;
    private String smokingPreference;
    private Integer socialLevel;
    private String guestTolerance;
    private String studyNoisePreference;
    private String description;

    // Property info (nullable — housemate may not be linked to any property)
    private Long propertyId;
    private String propertyTitle;
    private String propertyAddress;
    private String propertyCity;
    private String propertyState;

    // Matching results
    private double compatibilityScore;  // 0–100
    private String compatibilityLabel;  // "Best Match", "Good Match", "Fair Match"
    private List<String> matchedReasons; // e.g. ["Same gender", "Within budget", ...]

    /**
     * Factory method to build a response from a HousemateProfile entity and scoring results.
     * Safely handles null property (housemate not linked to any property).
     */
    public static MatchingResponseDTO fromEntity(HousemateProfile housemate,
                                                  double score,
                                                  String label,
                                                  List<String> reasons) {
        MatchingResponseDTOBuilder builder = MatchingResponseDTO.builder()
                .housemateId(housemate.getId())
                .userId(housemate.getUserId())
                .housemateName(housemate.getName())
                .gender(housemate.getGender())
                .age(housemate.getAge())
                .budget(housemate.getBudget())
                .occupationType(housemate.getOccupationType())
                .cleanlinessLevel(housemate.getCleanlinessLevel())
                .sleepSchedule(housemate.getSleepSchedule())
                .smokingPreference(housemate.getSmokingPreference())
                .socialLevel(housemate.getSocialLevel())
                .guestTolerance(housemate.getGuestTolerance())
                .studyNoisePreference(housemate.getStudyNoisePreference())
                .description(housemate.getDescription())
                .compatibilityScore(score)
                .compatibilityLabel(label)
                .matchedReasons(reasons);

        // Safely set property fields only if property exists
        if (housemate.getProperty() != null) {
            builder.propertyId(housemate.getProperty().getId())
                   .propertyTitle(housemate.getProperty().getTitle())
                   .propertyAddress(housemate.getProperty().getAddress())
                   .propertyCity(housemate.getProperty().getCity())
                   .propertyState(housemate.getProperty().getState());
        }

        return builder.build();
    }
}
