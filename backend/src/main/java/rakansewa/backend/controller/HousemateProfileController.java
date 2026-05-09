package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.HousemateProfile;
import rakansewa.backend.service.HousemateProfileService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/housemates")
public class HousemateProfileController {

    private final HousemateProfileService housemateProfileService;

    public HousemateProfileController(HousemateProfileService housemateProfileService) {
        this.housemateProfileService = housemateProfileService;
    }

    // POST /housemates?propertyId=1
    @PostMapping
    public ResponseEntity<HousemateProfile> createProfile(
            @RequestParam Long propertyId,
            @RequestBody HousemateProfile profile) {
        HousemateProfile saved = housemateProfileService.createProfile(propertyId, profile);
        return ResponseEntity.ok(saved);
    }

    // GET /housemates
    @GetMapping
    public ResponseEntity<List<HousemateProfile>> getAllProfiles() {
        List<HousemateProfile> profiles = housemateProfileService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }

    // GET /housemates/property/{propertyId}
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<HousemateProfile>> getProfilesByPropertyId(@PathVariable Long propertyId) {
        List<HousemateProfile> profiles = housemateProfileService.getProfilesByPropertyId(propertyId);
        return ResponseEntity.ok(profiles);
    }

    // GET /housemates/user/{userId} — Get a user's housemate profile
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable Long userId) {
        return housemateProfileService.getProfileByUserId(userId)
                .map(profile -> ResponseEntity.ok((Object) profile))
                .orElse(ResponseEntity.ok(Map.of("message", "No housemate profile found for this user.")));
    }

    // PUT /housemates/user/{userId}/link-property — Link/unlink a user to a property
    @PutMapping("/user/{userId}/link-property")
    public ResponseEntity<?> linkProperty(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        try {
            Long propertyId = null;
            if (body.containsKey("propertyId") && body.get("propertyId") != null) {
                propertyId = Long.valueOf(body.get("propertyId").toString());
            }
            HousemateProfile updated = housemateProfileService.linkPropertyToUser(userId, propertyId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
