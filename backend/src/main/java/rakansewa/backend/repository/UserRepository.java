package rakansewa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rakansewa.backend.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides built-in CRUD methods:
    // save(), findAll(), findById(), deleteById(), etc.

    Optional<User> findByEmail(String email);
}

