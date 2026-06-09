package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.dto.MatchingResponseDTO;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Matching Service for RakanSewa — Priority-Based Compatibility Scoring.
 *
 * Each student may set exactly 3 ordered priorities from the 8 available:
 *   Budget, Sleep Pattern, Cleanliness, Quietness,
 *   Social Style, Study Habit, Activity Level, Flexibility
 *
 * Score allocation:
 *   Priority 1  → 40 points
 *   Priority 2  → 30 points
 *   Priority 3  → 20 points
 *   Remaining 5 criteria (averaged) → 10 points
 *   Total maximum: 100 points
 *
 * Default priorities (when not set): Budget → Sleep Pattern → Cleanliness
 */
@Service
public class MatchingService {

    private final UserRepository userRepository;

    // All 8 valid priority names in a canonical order for "remaining" computation
    private static final List<String> ALL_PRIORITIES = List.of(
            "Budget", "Sleep Pattern", "Cleanliness", "Quietness",
            "Social Style", "Study Habit", "Activity Level", "Flexibility"
    );

    // Default priorities for users who have not set any
    private static final List<String> DEFAULT_PRIORITIES = List.of(
            "Budget", "Sleep Pattern", "Cleanliness"
    );

    public MatchingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==================== MAIN ENTRY POINTS ====================

    /**
     * Match a user against ALL other listed housemates.
     * Scoring is driven by the current user's selected priorities.
     */
    public List<MatchingResponseDTO> matchAllHousemates(Long userId) {
        Optional<User> currentUserOpt = userRepository.findById(userId);
        List<User> listedHousemates = userRepository.findByIsListedAsHousemateTrue();

        if (currentUserOpt.isEmpty()) {
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

    // ==================== PRIORITY-BASED SCORING ====================

    /**
     * Core scoring method.
     * Resolves the current user's 3 priorities, assigns weights, and scores
     * the candidate accordingly.
     */
    private MatchingResponseDTO scoreAndBuildResponse(User currentUser, User candidate) {
        List<String> reasons = new ArrayList<>();

        // Resolve priorities (fall back to defaults if not set)
        List<String> priorities = resolvePriorities(currentUser);

        String p1 = priorities.get(0); // 40 pts
        String p2 = priorities.get(1); // 30 pts
        String p3 = priorities.get(2); // 20 pts

        // Compute the 3 priority scores (normalised to their max weight)
        double score1 = scoreCriterion(p1, 40.0, currentUser, candidate, reasons);
        double score2 = scoreCriterion(p2, 30.0, currentUser, candidate, reasons);
        double score3 = scoreCriterion(p3, 20.0, currentUser, candidate, reasons);

        // Remaining 5 criteria — each contributes 2 pts max (5 × 2 = 10)
        List<String> remaining = ALL_PRIORITIES.stream()
                .filter(c -> !priorities.contains(c))
                .collect(Collectors.toList());

        double remainingScore = 0.0;
        for (String criterion : remaining) {
            remainingScore += scoreCriterion(criterion, 2.0, currentUser, candidate, reasons);
        }

        double totalScore = score1 + score2 + score3 + remainingScore;
        totalScore = Math.min(100, Math.round(totalScore));

        // Prepend priority-based matching note
        if (!reasons.isEmpty()) {
            reasons.add(0, "Priority match: " + p1 + " → " + p2 + " → " + p3);
        }

        String label = determineLabel(totalScore);
        return MatchingResponseDTO.fromUser(candidate, totalScore, label, reasons);
    }

    /**
     * Resolve a user's 3 priorities, falling back to defaults if any are missing.
     */
    private List<String> resolvePriorities(User user) {
        String p1 = user.getPriority1();
        String p2 = user.getPriority2();
        String p3 = user.getPriority3();

        boolean allSet = p1 != null && !p1.isBlank()
                && p2 != null && !p2.isBlank()
                && p3 != null && !p3.isBlank();

        if (allSet) {
            return List.of(p1.trim(), p2.trim(), p3.trim());
        }
        return DEFAULT_PRIORITIES;
    }

    /**
     * Score a single criterion normalised to the given maxPoints.
     * Raw scorer methods return a value in [0, 1] representing achievement.
     */
    private double scoreCriterion(String criterion,
                                   double maxPoints,
                                   User currentUser,
                                   User candidate,
                                   List<String> reasons) {
        double raw = switch (criterion) {
            case "Budget"         -> rawBudget(currentUser, candidate, reasons);
            case "Sleep Pattern"  -> rawSleep(currentUser, candidate, reasons);
            case "Cleanliness"    -> rawLifestyleTag("Clean", currentUser, candidate, reasons);
            case "Quietness"      -> rawLifestyleTag("Quiet", currentUser, candidate, reasons);
            case "Social Style"   -> rawLifestyleTag("Social", currentUser, candidate, reasons);
            case "Study Habit"    -> rawLifestyleTag("Studious", currentUser, candidate, reasons);
            case "Activity Level" -> rawLifestyleTag("Active", currentUser, candidate, reasons);
            case "Flexibility"    -> rawLifestyleTag("Flexible", currentUser, candidate, reasons);
            default               -> 0.0;
        };
        return raw * maxPoints;
    }

    // ==================== RAW SCORERS (return 0.0 – 1.0) ====================

    /**
     * Budget proximity scorer.
     * Returns 1.0 if budgets are within 10%, 0.67 within 30%, 0.33 within 50%.
     */
    private double rawBudget(User currentUser, User candidate, List<String> reasons) {
        Double userBudget = currentUser.getBudget();
        Double mateBudget = candidate.getBudget();

        if (userBudget == null || mateBudget == null || userBudget <= 0 || mateBudget <= 0) return 0.0;

        double diff = Math.abs(userBudget - mateBudget);
        double avg  = (userBudget + mateBudget) / 2.0;
        double pct  = avg > 0 ? diff / avg : 1.0;

        if (pct <= 0.10) {
            addReasonIfAbsent(reasons, "Very similar budget range");
            return 1.0;
        } else if (pct <= 0.30) {
            addReasonIfAbsent(reasons, "Compatible budget range");
            return 0.67;
        } else if (pct <= 0.50) {
            addReasonIfAbsent(reasons, "Somewhat similar budget");
            return 0.33;
        }
        return 0.0;
    }

    /**
     * Sleep schedule scorer.
     * Returns 1.0 for exact match, 0.5 if either is Flexible.
     */
    private double rawSleep(User currentUser, User candidate, List<String> reasons) {
        String userSleep = currentUser.getSleepSchedule();
        String mateSleep = candidate.getSleepSchedule();

        if (userSleep == null || mateSleep == null) return 0.0;

        if (userSleep.equalsIgnoreCase(mateSleep)) {
            addReasonIfAbsent(reasons, "Same sleep pattern: " + mateSleep);
            return 1.0;
        }
        if (userSleep.equalsIgnoreCase("Flexible") || mateSleep.equalsIgnoreCase("Flexible")) {
            addReasonIfAbsent(reasons, "Flexible sleep schedule");
            return 0.5;
        }
        return 0.0;
    }

    /**
     * Single lifestyle tag scorer.
     * Returns 1.0 if both users share the specified tag, 0.0 otherwise.
     */
    private double rawLifestyleTag(String tag, User currentUser, User candidate, List<String> reasons) {
        List<String> myTags   = parseLifestyle(currentUser.getLifestyle());
        List<String> theirTags = parseLifestyle(candidate.getLifestyle());

        if (myTags.isEmpty() || theirTags.isEmpty()) return 0.0;

        boolean myHas    = myTags.stream().anyMatch(t -> t.equalsIgnoreCase(tag));
        boolean theirHas = theirTags.stream().anyMatch(t -> t.equalsIgnoreCase(tag));

        if (myHas && theirHas) {
            addReasonIfAbsent(reasons, "Shared lifestyle: " + tag);
            return 1.0;
        }
        return 0.0;
    }

    // ==================== HELPERS ====================

    private List<String> parseLifestyle(String lifestyle) {
        if (lifestyle == null || lifestyle.isBlank()) return List.of();
        return Arrays.stream(lifestyle.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /** Avoids duplicate reason strings in the list. */
    private void addReasonIfAbsent(List<String> reasons, String reason) {
        if (!reasons.contains(reason)) {
            reasons.add(reason);
        }
    }

    // ==================== LABEL DETERMINATION ====================

    private String determineLabel(double score) {
        if (score >= 75) return "Great Match";
        if (score >= 50) return "Good Match";
        if (score >= 25) return "Fair Match";
        return "Low Match";
    }
}
