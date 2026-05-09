package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.HousemateProfile;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.HousemateProfileRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class HousemateProfileService {

    private final HousemateProfileRepository housemateProfileRepository;
    private final PropertyRepository propertyRepository;

    public HousemateProfileService(HousemateProfileRepository housemateProfileRepository,
                                   PropertyRepository propertyRepository) {
        this.housemateProfileRepository = housemateProfileRepository;
        this.propertyRepository = propertyRepository;
    }

    // Create a new housemate profile linked to a property
    public HousemateProfile createProfile(Long propertyId, HousemateProfile profile) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        profile.setProperty(property);
        return housemateProfileRepository.save(profile);
    }

    // Get all housemate profiles
    public List<HousemateProfile> getAllProfiles() {
        return housemateProfileRepository.findAll();
    }

    // Get all profiles for a specific property
    public List<HousemateProfile> getProfilesByPropertyId(Long propertyId) {
        return housemateProfileRepository.findByPropertyId(propertyId);
    }

    // Get a housemate profile by userId
    public Optional<HousemateProfile> getProfileByUserId(Long userId) {
        return housemateProfileRepository.findByUserId(userId);
    }

    /**
     * Link or unlink a user's housemate profile to a property.
     * Creates a minimal HousemateProfile if one doesn't exist for this user.
     */
    public HousemateProfile linkPropertyToUser(Long userId, Long propertyId) {
        HousemateProfile profile = housemateProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    HousemateProfile newProfile = new HousemateProfile();
                    newProfile.setUserId(userId);
                    return newProfile;
                });

        if (propertyId != null) {
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));
            profile.setProperty(property);
        } else {
            profile.setProperty(null);
        }

        return housemateProfileRepository.save(profile);
    }

    /**
     * Unlink a user's housemate profile from any property.
     */
    public HousemateProfile unlinkProperty(Long userId) {
        return linkPropertyToUser(userId, null);
    }
}
