package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection (recommended over @Autowired on fields)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
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
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
