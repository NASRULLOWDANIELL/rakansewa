package rakansewa.backend.dto;

import lombok.*;
import rakansewa.backend.model.User;

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

    private Long userId;
    private String housemateName;
    private Double budget;
    private String sleepSchedule;
    private String lifestyle;

    // Property info (nullable — housemate may not be linked to any property)
    private Long propertyId;
    private String propertyTitle;
    private String propertyAddress;
    private String propertyCity;
    private String propertyState;

    // Matching results
    private double compatibilityScore;  // 0–100
    private String compatibilityLabel;  // "Great Match", "Good Match", "Fair Match"
    private List<String> matchedReasons; // e.g. ["Same sleep pattern", "Within budget", ...]

    /**
     * Factory method to build a response from a User entity and scoring results.
     * Safely handles null linkedProperty (housemate not linked to any property).
     */
    public static MatchingResponseDTO fromUser(User user,
                                               double score,
                                               String label,
                                               List<String> reasons) {
        MatchingResponseDTOBuilder builder = MatchingResponseDTO.builder()
                .userId(user.getId())
                .housemateName(user.getName())
                .budget(user.getBudget())
                .sleepSchedule(user.getSleepSchedule())
                .lifestyle(user.getLifestyle())
                .compatibilityScore(score)
                .compatibilityLabel(label)
                .matchedReasons(reasons);

        // Safely set property fields only if linkedProperty exists
        if (user.getLinkedProperty() != null) {
            builder.propertyId(user.getLinkedProperty().getId())
                   .propertyTitle(user.getLinkedProperty().getTitle())
                   .propertyAddress(user.getLinkedProperty().getAddress())
                   .propertyCity(user.getLinkedProperty().getCity())
                   .propertyState(user.getLinkedProperty().getState());
        }

        return builder.build();
    }
}
