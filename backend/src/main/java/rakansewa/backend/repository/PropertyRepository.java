package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.Property;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    // JpaRepository provides: save(), findAll(), findById(), deleteById(), etc.

    List<Property> findByOwnerId(Long ownerId);

    List<Property> findByApprovalStatus(String approvalStatus);
}
