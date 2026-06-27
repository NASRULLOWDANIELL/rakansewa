package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.PropertyUpdate;

import java.util.List;

@Repository
public interface PropertyUpdateRepository extends JpaRepository<PropertyUpdate, Long> {
    List<PropertyUpdate> findAllByOrderByUpdatedAtDesc();
}
