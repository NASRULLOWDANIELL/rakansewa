package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.HousemateProfile;

import java.util.List;

@Repository
public interface HousemateProfileRepository extends JpaRepository<HousemateProfile, Long> {
    
    // Auto-generates query to find all housemate profiles by the linked property's ID
    List<HousemateProfile> findByPropertyId(Long propertyId);
}
