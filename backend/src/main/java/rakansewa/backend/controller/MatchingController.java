package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.dto.MatchingResponseDTO;
import rakansewa.backend.service.MatchingService;

import java.util.List;

/**
 * REST controller for the users-based housemate matching system.
 *
 * All matching is now powered by the users table (isListedAsHousemate = true).
 */
@RestController
@RequestMapping("/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /**
     * GET /matching/user/{userId}
     *
     * Matches a user against ALL other listed housemates (users table).
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
