package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.PropertyRepository;
import rakansewa.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
    private static final String UITM_STUDENT_DOMAIN = "@student.uitm.edu.my";

    // Constructor injection (recommended over @Autowired on fields)
    public UserService(UserRepository userRepository,
            PropertyRepository propertyRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // Validate uniqueness of matric number and UiTM email
        validateUniqueness(user, null);

        // Validate matric number matches UiTM email prefix
        validateMatricEmailMatch(user);

        updateVerificationStatus(user);

        // For manual registration: set emailVerified=true by default (no longer using
        // email verification flow)
        if (user.getAuthProvider() == null || !"GOOGLE".equalsIgnoreCase(user.getAuthProvider())) {
            user.setAuthProvider("LOCAL");
            user.setEmailVerified(true); // No longer requiring email verification
        }

        User savedUser = userRepository.save(user);
        return savedUser;
    }

    /**
     * Creates a user from Google OAuth. Sets emailVerified=true and
     * authProvider=GOOGLE.
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
            // Extract matric number from email
            String emailUsername = email.substring(0, email.toLowerCase().indexOf(UITM_STUDENT_DOMAIN));
            user.setMatricNumber(emailUsername);
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
            // Validate uniqueness (exclude current user)
            validateUniqueness(updatedUser, id);

            // Validate matric number matches UiTM email prefix
            validateMatricEmailMatch(updatedUser);

            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            user.setIsListedAsHousemate(updatedUser.getIsListedAsHousemate());
            user.setBudget(updatedUser.getBudget());
            user.setLifestyle(updatedUser.getLifestyle());
            user.setSleepSchedule(updatedUser.getSleepSchedule());

            // Persist compatibility priorities
            user.setPriority1(updatedUser.getPriority1());
            user.setPriority2(updatedUser.getPriority2());
            user.setPriority3(updatedUser.getPriority3());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setMatricNumber(updatedUser.getMatricNumber());
            user.setUitmEmail(updatedUser.getUitmEmail());

            // Persist profile image URL (nullable — null means no change from client)
            System.out.println("BACKEND: Received profileImageUrl = " + updatedUser.getProfileImageUrl());
            if (updatedUser.getProfileImageUrl() != null) {
                user.setProfileImageUrl(updatedUser.getProfileImageUrl());
            }

            updateVerificationStatus(user);

            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Link a user to a rental property.
     */
    public User linkProperty(Long userId, Long propertyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (propertyId != null) {
            rakansewa.backend.model.Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));
            user.setLinkedProperty(property);
        } else {
            user.setLinkedProperty(null);
        }

        return userRepository.save(user);
    }

    /**
     * Unlink a user from any property.
     */
    public User unlinkProperty(Long userId) {
        return linkProperty(userId, null);
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
     * UiTM Student Verification Logic:
     * A student is verified if their matricNumber equals the email username
     * before @student.uitm.edu.my.
     * 
     * Example verified: matricNumber=2022456146,
     * uitmEmail=2022456146@student.uitm.edu.my
     * Example not verified: matricNumber=2022456146,
     * uitmEmail=nasrul@student.uitm.edu.my
     */
    private void updateVerificationStatus(User user) {
        if (!"Student".equalsIgnoreCase(user.getRole())) {
            // Don't auto-verify non-student accounts
            return;
        }

        boolean verified = false;

        String matricNumber = user.getMatricNumber();
        String uitmEmail = user.getUitmEmail();

        if (matricNumber != null && !matricNumber.trim().isEmpty()
                && uitmEmail != null && !uitmEmail.trim().isEmpty()) {

            String emailLower = uitmEmail.trim().toLowerCase();

            // Check that the email ends with the UiTM student domain
            if (emailLower.endsWith(UITM_STUDENT_DOMAIN)) {
                // Extract the username part before @student.uitm.edu.my
                String emailUsername = emailLower.substring(0, emailLower.indexOf(UITM_STUDENT_DOMAIN));

                // Verify: matric number must exactly match the email username
                if (matricNumber.trim().equalsIgnoreCase(emailUsername)) {
                    verified = true;
                }
            }
        }

        user.setIsStudentVerified(verified);
    }

    /**
     * Validate that matric number matches UiTM email prefix.
     * If both are provided, the matric number must be the email username
     * before @student.uitm.edu.my.
     * This prevents users from entering fake matric numbers that don't match their
     * UiTM email.
     */
    private void validateMatricEmailMatch(User user) {
        String matricNumber = user.getMatricNumber();
        String uitmEmail = user.getUitmEmail();

        // Only validate if both fields are provided
        if (matricNumber != null && !matricNumber.trim().isEmpty()
                && uitmEmail != null && !uitmEmail.trim().isEmpty()) {

            String emailLower = uitmEmail.trim().toLowerCase();

            // UiTM email must end with the correct domain
            if (!emailLower.endsWith(UITM_STUDENT_DOMAIN)) {
                throw new RuntimeException("UiTM email must end with " + UITM_STUDENT_DOMAIN);
            }

            // Extract the username part and compare with matric number
            String emailUsername = emailLower.substring(0, emailLower.indexOf(UITM_STUDENT_DOMAIN));
            if (!matricNumber.trim().equalsIgnoreCase(emailUsername)) {
                throw new RuntimeException("Matric number must match your UiTM student email.");
            }
        }
    }

    /**
     * Validate uniqueness of matric number and UiTM email.
     * During profile update, excludes the current user from duplicate checks.
     */
    private void validateUniqueness(User user, Long currentUserId) {
        // Check matric number uniqueness
        if (user.getMatricNumber() != null && !user.getMatricNumber().trim().isEmpty()) {
            Optional<User> existingByMatric = userRepository.findByMatricNumber(user.getMatricNumber().trim());
            if (existingByMatric.isPresent()) {
                Long existingId = existingByMatric.get().getId();
                if (currentUserId == null || !existingId.equals(currentUserId)) {
                    throw new RuntimeException("This matric number is already used by another account.");
                }
            }
        }

        // Check UiTM email uniqueness
        if (user.getUitmEmail() != null && !user.getUitmEmail().trim().isEmpty()) {
            Optional<User> existingByUitmEmail = userRepository.findByUitmEmail(user.getUitmEmail().trim());
            if (existingByUitmEmail.isPresent()) {
                Long existingId = existingByUitmEmail.get().getId();
                if (currentUserId == null || !existingId.equals(currentUserId)) {
                    throw new RuntimeException("This UiTM email is already used by another account.");
                }
            }
        }
    }
}
