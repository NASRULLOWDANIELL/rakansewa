package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.Favorite;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByPropertyId(Long propertyId);

    List<Favorite> findByUserEmail(String userEmail);

    Optional<Favorite> findByUserEmailAndPropertyId(String userEmail, Long propertyId);

    boolean existsByUserEmailAndPropertyId(String userEmail, Long propertyId);
}
