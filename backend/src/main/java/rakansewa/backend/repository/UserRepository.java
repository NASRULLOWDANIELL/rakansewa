package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides built-in CRUD methods:
    // save(), findAll(), findById(), deleteById(), etc.

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByMatricNumber(String matricNumber);

    Optional<User> findByUitmEmail(String uitmEmail);

    // Find all users who are listed as housemates
    List<User> findByIsListedAsHousemateTrue();

    // Find all users linked to a specific property
    List<User> findByLinkedPropertyId(Long propertyId);
}
