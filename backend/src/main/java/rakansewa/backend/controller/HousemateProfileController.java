package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.HousemateProfile;
import rakansewa.backend.service.HousemateProfileService;

import java.util.List;

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
}
