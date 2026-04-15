package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.RentalRequest;

import java.util.List;

@Repository
public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {

    // Custom query method — Spring Data JPA generates the SQL automatically
    List<RentalRequest> findByPropertyId(Long propertyId);
}
