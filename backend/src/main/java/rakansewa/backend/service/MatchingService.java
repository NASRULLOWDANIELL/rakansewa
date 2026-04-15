package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.dto.MatchingRequestDTO;
import rakansewa.backend.dto.MatchingResponseDTO;
import rakansewa.backend.model.HousemateProfile;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.HousemateProfileRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Rule-Based Matching Service for RakanSewa.
 *
 * Matching uses two phases:
 *   1. Hard Rules  — Filter out incompatible candidates (gender, budget, smoking, availability).
 *   2. Soft Rules  — Score remaining candidates on weighted lifestyle criteria.
 *
 * The result is a ranked list of housemates sorted by compatibility score (highest first).
 */
@Service
public class MatchingService {

    private final HousemateProfileRepository housemateProfileRepository;
    private final PropertyRepository propertyRepository;

    public MatchingService(HousemateProfileRepository housemateProfileRepository,
                           PropertyRepository propertyRepository) {
        this.housemateProfileRepository = housemateProfileRepository;
        this.propertyRepository = propertyRepository;
    }

    // ==================== CLEANLINESS MAP ====================

    private static final Map<String, Integer> CLEANLINESS_MAP = Map.of(
            "very flexible", 1,
            "flexible", 2,
            "moderate", 3,
            "strict", 4,
            "very strict", 5
    );

    // ==================== GUEST TOLERANCE MAP ====================

    private static final Map<String, Integer> GUEST_TOLERANCE_MAP = Map.of(
            "rarely", 1,
            "sometimes", 2,
            "often", 3
    );

    // ==================== NOISE PREFERENCE MAP ====================

    private static final Map<String, Integer> NOISE_MAP = Map.of(
            "silent", 1,
            "low noise", 2,
            "flexible", 3
    );

    // ==================== SOFT RULE WEIGHTS ====================
    // Weights must sum to 100

    private static final double WEIGHT_CLEANLINESS  = 25.0;
    private static final double WEIGHT_SLEEP        = 20.0;
    private static final double WEIGHT_SOCIAL       = 15.0;
    private static final double WEIGHT_OCCUPATION   = 15.0;
    private static final double WEIGHT_GUEST        = 12.5;
    private static final double WEIGHT_NOISE        = 12.5;

    // ==================== MAIN ENTRY POINT ====================

    /**
     * Find compatible housemates for the given property based on user preferences.
     *
     * @param request    The user's preference fields from the frontend form
     * @param propertyId The property to search housemates under
     * @return Sorted list of matching results (best matches first)
     */
    public List<MatchingResponseDTO> findMatches(MatchingRequestDTO request, Long propertyId) {

        // Validate the property exists and is available
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        // Get all housemate profiles for this property
        List<HousemateProfile> housemates = housemateProfileRepository.findByPropertyId(propertyId);

        // Phase 1: Apply hard rules to filter out incompatible candidates
        // Phase 2: Score remaining candidates using soft rules
        // Phase 3: Sort by score and return
        return housemates.stream()
                .filter(housemate -> passesHardRules(request, housemate, property))
                .map(housemate -> scoreAndBuildResponse(request, housemate))
                .sorted(Comparator.comparingDouble(MatchingResponseDTO::getCompatibilityScore).reversed())
                .collect(Collectors.toList());
    }

    // ==================== PHASE 1: HARD RULES ====================

    /**
     * Hard rules act as binary filters — a candidate must pass ALL of them.
     * If any hard rule fails, the candidate is excluded entirely.
     */
    private boolean passesHardRules(MatchingRequestDTO request, HousemateProfile housemate, Property property) {
        return passesGenderRule(request, housemate)
                && passesBudgetRule(request, housemate)
                && passesSmokingRule(request, housemate)
                && passesAvailabilityRule(property);
    }

    /**
     * Gender compatibility (bidirectional check):
     * 1. The user's preferred gender must accept the housemate's gender
     * 2. The housemate's preferred gender must accept the user's gender
     */
    private boolean passesGenderRule(MatchingRequestDTO request, HousemateProfile housemate) {
        // Check if user accepts the housemate's gender
        if (!isGenderAccepted(request.getPreferredGender(), housemate.getGender())) {
            return false;
        }
        // Check if housemate accepts the user's gender
        return isGenderAccepted(housemate.getPreferredGender(), request.getGender());
    }

    private boolean isGenderAccepted(String preferredGender, String actualGender) {
        if (preferredGender == null || actualGender == null) return true;
        if (preferredGender.equalsIgnoreCase("Any")) return true;
        // "Male Only" should accept "Male", "Female Only" should accept "Female"
        return preferredGender.toLowerCase().contains(actualGender.toLowerCase());
    }

    /**
     * Budget compatibility:
     * The housemate's budget must be within the user's max budget (± 30% tolerance).
     * If user has no budget preference, this rule passes.
     */
    private boolean passesBudgetRule(MatchingRequestDTO request, HousemateProfile housemate) {
        if (request.getMaxBudget() == null || request.getMaxBudget() <= 0) return true;
        if (housemate.getBudget() == null) return true;

        double maxAllowed = request.getMaxBudget() * 1.30;
        return housemate.getBudget() <= maxAllowed;
    }

    /**
     * Smoking compatibility:
     * Non-smoker users won't match with smoker housemates (unless preference is "No Preference").
     */
    private boolean passesSmokingRule(MatchingRequestDTO request, HousemateProfile housemate) {
        if (request.getSmokingPreference() == null || housemate.getSmokingPreference() == null) return true;
        if (request.getSmokingPreference().equalsIgnoreCase("No Preference")) return true;

        // If user is "Non-Smoker", only match with "Non-Smoker" housemates
        if (request.getSmokingPreference().equalsIgnoreCase("Non-Smoker")) {
            return housemate.getSmokingPreference().equalsIgnoreCase("Non-Smoker");
        }

        return true; // Smoker users match with anyone
    }

    /**
     * Property/room availability check.
     */
    private boolean passesAvailabilityRule(Property property) {
        if (property.getAvailabilityStatus() == null) return true;
        return property.getAvailabilityStatus().equalsIgnoreCase("Available");
    }

    // ==================== PHASE 2: SOFT SCORING ====================

    /**
     * Score a candidate using weighted soft rules and build the response DTO.
     */
    private MatchingResponseDTO scoreAndBuildResponse(MatchingRequestDTO request, HousemateProfile housemate) {

        List<String> reasons = new ArrayList<>();
        double totalScore = 0.0;

        // --- Gender reason (already passed hard rule, so always add) ---
        addGenderReason(request, housemate, reasons);

        // --- Budget reason ---
        addBudgetReason(request, housemate, reasons);

        // --- Smoking reason ---
        addSmokingReason(request, housemate, reasons);

        // --- Cleanliness (weighted) ---
        totalScore += scoreCleanliness(request, housemate, reasons);

        // --- Sleep schedule (weighted) ---
        totalScore += scoreSleepSchedule(request, housemate, reasons);

        // --- Social level (weighted) ---
        totalScore += scoreSocialLevel(request, housemate, reasons);

        // --- Occupation type (weighted) ---
        totalScore += scoreOccupationType(request, housemate, reasons);

        // --- Guest tolerance (weighted) ---
        totalScore += scoreGuestTolerance(request, housemate, reasons);

        // --- Study/noise preference (weighted) ---
        totalScore += scoreNoisePreference(request, housemate, reasons);

        // Round to 1 decimal place
        totalScore = Math.round(totalScore * 10.0) / 10.0;

        String label = determineLabel(totalScore);

        return MatchingResponseDTO.fromEntity(housemate, totalScore, label, reasons);
    }

    // ---------- Reason builders for hard-rule matches ----------

    private void addGenderReason(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getGender() != null && housemate.getGender() != null) {
            if (request.getGender().equalsIgnoreCase(housemate.getGender())) {
                reasons.add("Same gender");
            } else {
                reasons.add("Gender compatible");
            }
        }
    }

    private void addBudgetReason(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getMaxBudget() != null && housemate.getBudget() != null) {
            if (housemate.getBudget() <= request.getMaxBudget()) {
                reasons.add("Within budget (RM " + housemate.getBudget().intValue() + ")");
            } else {
                reasons.add("Slightly above budget (RM " + housemate.getBudget().intValue() + ")");
            }
        }
    }

    private void addSmokingReason(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getSmokingPreference() != null && housemate.getSmokingPreference() != null) {
            if (request.getSmokingPreference().equalsIgnoreCase(housemate.getSmokingPreference())) {
                reasons.add("Same smoking preference");
            }
        }
    }

    // ---------- Soft scoring functions ----------

    /**
     * Cleanliness similarity (25% weight).
     * Compares numeric cleanliness levels. Closer = higher score.
     */
    private double scoreCleanliness(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getCleanlinessLevel() == null || housemate.getCleanlinessLevel() == null) {
            return WEIGHT_CLEANLINESS; // If data missing, give full points
        }

        int userLevel = request.getCleanlinessLevel();
        Integer mateLevel = CLEANLINESS_MAP.getOrDefault(housemate.getCleanlinessLevel().toLowerCase(), 3);

        int diff = Math.abs(userLevel - mateLevel);
        double ratio;

        if (diff == 0) {
            ratio = 1.0;
            reasons.add("Similar cleanliness standards");
        } else if (diff == 1) {
            ratio = 0.75;
            reasons.add("Close cleanliness standards");
        } else if (diff == 2) {
            ratio = 0.4;
        } else {
            ratio = 0.1;
        }

        return WEIGHT_CLEANLINESS * ratio;
    }

    /**
     * Sleep schedule match (20% weight).
     * Exact match = full, "Flexible" with anything = 75%, else 0.
     */
    private double scoreSleepSchedule(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getSleepSchedule() == null || housemate.getSleepSchedule() == null) {
            return WEIGHT_SLEEP;
        }

        String userSleep = request.getSleepSchedule().toLowerCase();
        String mateSleep = housemate.getSleepSchedule().toLowerCase();

        if (userSleep.equals(mateSleep)) {
            reasons.add("Same sleep schedule (" + housemate.getSleepSchedule() + ")");
            return WEIGHT_SLEEP;
        }

        if (userSleep.equals("flexible") || mateSleep.equals("flexible")) {
            reasons.add("Flexible sleep schedule");
            return WEIGHT_SLEEP * 0.75;
        }

        return 0.0;
    }

    /**
     * Social level similarity (15% weight).
     * Scale 1–5 comparison.
     */
    private double scoreSocialLevel(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getSocialLevel() == null || housemate.getSocialLevel() == null) {
            return WEIGHT_SOCIAL;
        }

        int diff = Math.abs(request.getSocialLevel() - housemate.getSocialLevel());
        double ratio;

        if (diff == 0) {
            ratio = 1.0;
            reasons.add("Same social preference");
        } else if (diff == 1) {
            ratio = 0.75;
            reasons.add("Compatible social preference");
        } else if (diff == 2) {
            ratio = 0.4;
        } else {
            ratio = 0.1;
        }

        return WEIGHT_SOCIAL * ratio;
    }

    /**
     * Occupation type match (15% weight).
     * Exact match = full, else partial.
     */
    private double scoreOccupationType(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getOccupationType() == null || housemate.getOccupationType() == null) {
            return WEIGHT_OCCUPATION;
        }

        if (request.getOccupationType().equalsIgnoreCase(housemate.getOccupationType())) {
            reasons.add("Same occupation type (" + housemate.getOccupationType() + ")");
            return WEIGHT_OCCUPATION;
        }

        return WEIGHT_OCCUPATION * 0.3;
    }

    /**
     * Guest tolerance similarity (12.5% weight).
     */
    private double scoreGuestTolerance(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getGuestTolerance() == null || housemate.getGuestTolerance() == null) {
            return WEIGHT_GUEST;
        }

        Integer userLevel = GUEST_TOLERANCE_MAP.getOrDefault(request.getGuestTolerance().toLowerCase(), 2);
        Integer mateLevel = GUEST_TOLERANCE_MAP.getOrDefault(housemate.getGuestTolerance().toLowerCase(), 2);

        int diff = Math.abs(userLevel - mateLevel);

        if (diff == 0) {
            reasons.add("Similar guest tolerance");
            return WEIGHT_GUEST;
        } else if (diff == 1) {
            return WEIGHT_GUEST * 0.6;
        }

        return WEIGHT_GUEST * 0.2;
    }

    /**
     * Study/noise preference similarity (12.5% weight).
     */
    private double scoreNoisePreference(MatchingRequestDTO request, HousemateProfile housemate, List<String> reasons) {
        if (request.getStudyNoisePreference() == null || housemate.getStudyNoisePreference() == null) {
            return WEIGHT_NOISE;
        }

        Integer userLevel = NOISE_MAP.getOrDefault(request.getStudyNoisePreference().toLowerCase(), 2);
        Integer mateLevel = NOISE_MAP.getOrDefault(housemate.getStudyNoisePreference().toLowerCase(), 2);

        int diff = Math.abs(userLevel - mateLevel);

        if (diff == 0) {
            reasons.add("Same noise/study preference");
            return WEIGHT_NOISE;
        } else if (diff == 1) {
            return WEIGHT_NOISE * 0.6;
        }

        return WEIGHT_NOISE * 0.2;
    }

    // ==================== LABEL DETERMINATION ====================

    /**
     * Determine a human-readable compatibility label.
     *   85–100 → "Best Match"
     *   65–84  → "Good Match"
     *   below 65 → "Fair Match"
     */
    private String determineLabel(double score) {
        if (score >= 85) return "Best Match";
        if (score >= 65) return "Good Match";
        return "Fair Match";
    }
}
