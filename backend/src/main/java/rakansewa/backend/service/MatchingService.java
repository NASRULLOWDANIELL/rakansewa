package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.dto.MatchingResponseDTO;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Matching Service for RakanSewa — Users-based matching.
 *
 * Uses the users table (isListedAsHousemate = true) as the sole source
 * for housemate listings and compatibility scoring.
 *
 * Matching criteria (from User fields):
 *   - budget proximity
 *   - lifestyle overlap (comma-separated multi-select)
 *   - sleepSchedule compatibility
 */
@Service
public class MatchingService {

    private final UserRepository userRepository;

    public MatchingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==================== MAIN ENTRY POINT ====================

    /**
     * Match a user against ALL other listed housemates.
     * This powers the housemate-first flow on the Housemates page.
     *
     * @param userId The current user's ID
     * @return Sorted list of matching results (best matches first),
     *         excluding the user themselves
     */
    public List<MatchingResponseDTO> matchAllHousemates(Long userId) {
        Optional<User> currentUserOpt = userRepository.findById(userId);
        List<User> listedHousemates = userRepository.findByIsListedAsHousemateTrue();

        if (currentUserOpt.isEmpty()) {
            // User not found — return all housemates with 0 score
            return listedHousemates.stream()
                    .map(u -> MatchingResponseDTO.fromUser(u, 0, "Low Match", List.of()))
                    .collect(Collectors.toList());
        }

        User currentUser = currentUserOpt.get();

        return listedHousemates.stream()
                .filter(u -> !userId.equals(u.getId())) // Exclude self
                .map(u -> scoreAndBuildResponse(currentUser, u))
                .sorted(Comparator.comparingDouble(MatchingResponseDTO::getCompatibilityScore).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get housemates linked to a specific property, with match scoring
     * against the current user (if provided).
     *
     * @param propertyId The property to search housemates under
     * @param currentUserId Optional current user ID for scoring (can be null)
     * @return List of matching results for housemates at this property
     */
    public List<MatchingResponseDTO> getHousematesForProperty(Long propertyId, Long currentUserId) {
        List<User> linkedUsers = userRepository.findByLinkedPropertyId(propertyId);

        User currentUser = null;
        if (currentUserId != null) {
            currentUser = userRepository.findById(currentUserId).orElse(null);
        }

        final User finalCurrentUser = currentUser;
        return linkedUsers.stream()
                .filter(u -> u.getIsListedAsHousemate() != null && u.getIsListedAsHousemate())
                .map(u -> {
                    if (finalCurrentUser != null && !currentUserId.equals(u.getId())) {
                        return scoreAndBuildResponse(finalCurrentUser, u);
                    }
                    return MatchingResponseDTO.fromUser(u, 0, "Low Match", List.of());
                })
                .sorted(Comparator.comparingDouble(MatchingResponseDTO::getCompatibilityScore).reversed())
                .collect(Collectors.toList());
    }

    // ==================== SCORING ====================

    /**
     * Score a candidate user against the current user and build the response DTO.
     * Uses: budget, lifestyle, sleepSchedule.
     */
    private MatchingResponseDTO scoreAndBuildResponse(User currentUser, User candidate) {
        List<String> reasons = new ArrayList<>();
        double totalScore = 0.0;

        // --- Lifestyle overlap (40% weight) ---
        totalScore += scoreLifestyle(currentUser, candidate, reasons);

        // --- Sleep schedule (30% weight) ---
        totalScore += scoreSleepSchedule(currentUser, candidate, reasons);

        // --- Budget proximity (30% weight) ---
        totalScore += scoreBudget(currentUser, candidate, reasons);

        // Round to nearest integer
        totalScore = Math.min(100, Math.round(totalScore));

        String label = determineLabel(totalScore);

        return MatchingResponseDTO.fromUser(candidate, totalScore, label, reasons);
    }

    // ---------- Lifestyle scoring (40 points max) ----------

    private double scoreLifestyle(User currentUser, User candidate, List<String> reasons) {
        List<String> myLifestyles = parseLifestyle(currentUser.getLifestyle());
        List<String> theirLifestyles = parseLifestyle(candidate.getLifestyle());

        if (myLifestyles.isEmpty() || theirLifestyles.isEmpty()) {
            return 0; // No data to compare
        }

        List<String> overlap = myLifestyles.stream()
                .filter(theirLifestyles::contains)
                .collect(Collectors.toList());

        if (overlap.isEmpty()) return 0;

        double ratio = (double) overlap.size() / Math.max(myLifestyles.size(), 1);
        double score = ratio * 40.0;

        reasons.add("Shared lifestyle: " + String.join(", ", overlap));
        return score;
    }

    private List<String> parseLifestyle(String lifestyle) {
        if (lifestyle == null || lifestyle.isBlank()) return List.of();
        return Arrays.stream(lifestyle.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ---------- Sleep schedule scoring (30 points max) ----------

    private double scoreSleepSchedule(User currentUser, User candidate, List<String> reasons) {
        String userSleep = currentUser.getSleepSchedule();
        String mateSleep = candidate.getSleepSchedule();

        if (userSleep == null || mateSleep == null) return 0;

        if (userSleep.equalsIgnoreCase(mateSleep)) {
            reasons.add("Same sleep pattern: " + mateSleep);
            return 30.0;
        }

        if (userSleep.equalsIgnoreCase("Flexible") || mateSleep.equalsIgnoreCase("Flexible")) {
            reasons.add("Flexible sleep schedule");
            return 15.0;
        }

        return 0;
    }

    // ---------- Budget proximity scoring (30 points max) ----------

    private double scoreBudget(User currentUser, User candidate, List<String> reasons) {
        Double userBudget = currentUser.getBudget();
        Double mateBudget = candidate.getBudget();

        if (userBudget == null || mateBudget == null || userBudget <= 0 || mateBudget <= 0) return 0;

        double diff = Math.abs(userBudget - mateBudget);
        double avg = (userBudget + mateBudget) / 2;
        double pctDiff = avg > 0 ? diff / avg : 1;

        if (pctDiff <= 0.1) {
            reasons.add("Very similar budget range");
            return 30.0;
        } else if (pctDiff <= 0.3) {
            reasons.add("Compatible budget range");
            return 20.0;
        } else if (pctDiff <= 0.5) {
            reasons.add("Somewhat similar budget");
            return 10.0;
        }

        return 0;
    }

    // ==================== LABEL DETERMINATION ====================

    private String determineLabel(double score) {
        if (score >= 75) return "Great Match";
        if (score >= 50) return "Good Match";
        if (score >= 25) return "Fair Match";
        return "Low Match";
    }
}
