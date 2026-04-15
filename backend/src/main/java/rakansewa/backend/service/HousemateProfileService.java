package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.HousemateProfile;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.HousemateProfileRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.util.List;

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
}
