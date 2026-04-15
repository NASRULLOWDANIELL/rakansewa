package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.Property;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    // JpaRepository provides: save(), findAll(), findById(), deleteById(), etc.
}
