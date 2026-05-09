package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
    private static final String UITM_STUDENT_DOMAIN = "@student.uitm.edu.my";

    // Constructor injection (recommended over @Autowired on fields)
    public UserService(UserRepository userRepository,
                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        updateVerificationStatus(user);

        // For manual registration: set emailVerified=false and generate token
        if (user.getAuthProvider() == null || !"GOOGLE".equalsIgnoreCase(user.getAuthProvider())) {
            user.setAuthProvider("LOCAL");
            user.setEmailVerified(false);
            generateAndSetVerificationToken(user);
        }

        User savedUser = userRepository.save(user);

        // Send verification email for manual registrations
        if ("LOCAL".equalsIgnoreCase(savedUser.getAuthProvider())) {
            try {
                emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getEmailVerificationToken());
            } catch (Exception e) {
                // Log but don't fail registration
                System.err.println("Failed to send verification email: " + e.getMessage());
            }
        }

        return savedUser;
    }

    /**
     * Creates a user from Google OAuth. Sets emailVerified=true and authProvider=GOOGLE.
     * Only creates Student role accounts.
     */
    public User createGoogleUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setRole("Student");
        user.setAuthProvider("GOOGLE");
        user.setEmailVerified(true);

        // Generate a random BCrypt password (user will never use it directly)
        String randomPassword = UUID.randomUUID().toString();
        user.setPassword(passwordEncoder.encode(randomPassword));

        // Auto-fill UiTM email and verify if it's a UiTM student email
        if (email.toLowerCase().endsWith(UITM_STUDENT_DOMAIN)) {
            user.setUitmEmail(email);
            user.setIsStudentVerified(true);
        } else {
            user.setIsStudentVerified(false);
        }

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

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Verify email using token.
     * Returns the user if verification is successful.
     */
    public User verifyEmail(String token) {
        // Find user by verification token
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token."));

        if (user.getEmailVerificationTokenExpiry() != null
                && LocalDateTime.now().isAfter(user.getEmailVerificationTokenExpiry())) {
            throw new RuntimeException("Verification token has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        return userRepository.save(user);
    }

    /**
     * Resend verification email for a user who hasn't verified yet.
     */
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is already verified.");
        }

        generateAndSetVerificationToken(user);
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getEmailVerificationToken());
    }

    private void generateAndSetVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_EXPIRY_HOURS));
    }

    /**
     * Updated verification logic:
     * - If user's primary email ends with @student.uitm.edu.my, auto-verify as UiTM student
     * - Also auto-fill uitmEmail from primary email when applicable
     * - Backward compatible: still checks uitmEmail field if set separately
     * - Only applies to Student role users
     */
    private void updateVerificationStatus(User user) {
        if (!"Student".equalsIgnoreCase(user.getRole())) {
            // Don't auto-verify non-student accounts
            return;
        }

        boolean verified = false;

        // Check primary email domain
        if (user.getEmail() != null && user.getEmail().toLowerCase().endsWith(UITM_STUDENT_DOMAIN)) {
            verified = true;
            // Auto-fill uitmEmail from primary email if not already set
            if (user.getUitmEmail() == null || user.getUitmEmail().trim().isEmpty()) {
                user.setUitmEmail(user.getEmail());
            }
        }

        // Backward compatibility: also check separate uitmEmail field
        if (!verified && user.getUitmEmail() != null
                && user.getUitmEmail().toLowerCase().endsWith(UITM_STUDENT_DOMAIN)
                && user.getMatricNumber() != null && !user.getMatricNumber().trim().isEmpty()) {
            verified = true;
        }

        user.setIsStudentVerified(verified);
    }
}
