package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.dto.MatchingRequestDTO;
import rakansewa.backend.dto.MatchingResponseDTO;
import rakansewa.backend.service.MatchingService;

import java.util.List;

/**
 * REST controller for the rule-based housemate matching system.
 *
 * Endpoint: POST /matching/{propertyId}
 * Accepts user preferences in the request body and returns a sorted list
 * of compatible housemates with scores, labels, and reasons.
 */
@RestController
@RequestMapping("/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /**
     * POST /matching/{propertyId}
     *
     * Request body example:
     * {
     *   "gender": "Male",
     *   "preferredGender": "Any",
     *   "maxBudget": 800.0,
     *   "smokingPreference": "Non-Smoker",
     *   "cleanlinessLevel": 4,
     *   "sleepSchedule": "Night Owl",
     *   "socialLevel": 3,
     *   "occupationType": "Student",
     *   "guestTolerance": "Sometimes",
     *   "studyNoisePreference": "Low Noise"
     * }
     *
     * Returns a sorted list of MatchingResponseDTO (best matches first).
     */
    @PostMapping("/{propertyId}")
    public ResponseEntity<List<MatchingResponseDTO>> findMatches(
            @PathVariable Long propertyId,
            @RequestBody MatchingRequestDTO request) {

        List<MatchingResponseDTO> results = matchingService.findMatches(request, propertyId);
        return ResponseEntity.ok(results);
    }

    /**
     * GET /matching/user/{userId}
     *
     * Matches a user's housemate profile against ALL other listed housemates.
     * Powers the housemate-first page with compatibility scores.
     *
     * Returns a sorted list of MatchingResponseDTO (best matches first).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MatchingResponseDTO>> matchAllForUser(@PathVariable Long userId) {
        List<MatchingResponseDTO> results = matchingService.matchAllHousemates(userId);
        return ResponseEntity.ok(results);
    }
}
