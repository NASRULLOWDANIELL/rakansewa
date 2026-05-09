package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.HousemateProfile;

import java.util.List;
import java.util.Optional;

@Repository
public interface HousemateProfileRepository extends JpaRepository<HousemateProfile, Long> {
    
    // Auto-generates query to find all housemate profiles by the linked property's ID
    List<HousemateProfile> findByPropertyId(Long propertyId);

    // Find a housemate profile by the linked user's ID
    Optional<HousemateProfile> findByUserId(Long userId);
}
