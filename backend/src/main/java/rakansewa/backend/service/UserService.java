package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Constructor injection (recommended over @Autowired on fields)
    public UserService(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        updateVerificationStatus(user);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            user.setIsListedAsHousemate(updatedUser.getIsListedAsHousemate());
            user.setBudget(updatedUser.getBudget());
            user.setLifestyle(updatedUser.getLifestyle());
            user.setSleepSchedule(updatedUser.getSleepSchedule());
            
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setMatricNumber(updatedUser.getMatricNumber());
            user.setUitmEmail(updatedUser.getUitmEmail());
            
            updateVerificationStatus(user);

            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void updateVerificationStatus(User user) {
        if (user.getMatricNumber() != null && !user.getMatricNumber().trim().isEmpty() &&
            user.getUitmEmail() != null && user.getUitmEmail().toLowerCase().contains("uitm.edu.my")) {
            user.setIsStudentVerified(true);
        } else {
            user.setIsStudentVerified(false);
        }
    }
}
