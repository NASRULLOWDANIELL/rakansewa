package rakansewa.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.service.PasswordResetService;
import rakansewa.backend.service.UserService;

import rakansewa.backend.model.User;
import rakansewa.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final PasswordResetService passwordResetService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public AuthController(PasswordResetService passwordResetService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          UserService userService) {
        this.passwordResetService = passwordResetService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    /**
     * POST /auth/login
     * Validates user credentials and returns user info if successful.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // If user registered via Google, they can't login with password
            if ("GOOGLE".equalsIgnoreCase(user.getAuthProvider())) {
                return ResponseEntity.status(401).body(Map.of(
                    "message", "This account was created using Google Sign In. Please use Google to log in."
                ));
            }

            if (user.getPassword() != null && passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
    }

    /**
     * POST /auth/google-login
     * Handles Google OAuth sign-in with auto-registration.
     * If user exists, logs them in. If not, creates a Student account automatically.
     */
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");

        if (email == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Google profile information is required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            // Existing user — login normally
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "user", user,
                "isNewUser", false,
                "message", "Login successful."
            ));
        }

        // New user — auto-register as Student
        try {
            User newUser = userService.createGoogleUser(name, email);
            return ResponseEntity.ok(Map.of(
                "user", newUser,
                "isNewUser", true,
                "message", "Google account registered successfully. Please complete your profile."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to register account: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /auth/verify-email?token=...
     * Verifies user email and redirects to frontend with success/error status.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            userService.verifyEmail(token);
            // Redirect to frontend with success
            return ResponseEntity.status(302)
                    .header("Location", frontendUrl + "/login?verified=true")
                    .build();
        } catch (RuntimeException e) {
            // Redirect to frontend with error
            return ResponseEntity.status(302)
                    .header("Location", frontendUrl + "/login?verified=false&error=" + e.getMessage())
                    .build();
        }
    }

    /**
     * POST /auth/resend-verification
     * Resends the verification email.
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }

        try {
            userService.resendVerificationEmail(email.trim().toLowerCase());
            return ResponseEntity.ok(Map.of("message", "Verification email has been resent."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /auth/forgot-password
     * Always returns 200 with the same message regardless of whether the email exists.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email != null && !email.isBlank()) {
            try {
                passwordResetService.initiatePasswordReset(email.trim().toLowerCase());
            } catch (Exception e) {
                // Log but don't expose to client
                System.err.println("Error during password reset initiation: " + e.getMessage());
            }
        }
        // Always return the same response to prevent user enumeration
        return ResponseEntity.ok(Map.of(
            "message", "If an account with that email exists, a password reset link has been sent."
        ));
    }

    /**
     * POST /auth/reset-password
     * Validates the token and updates the password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Token and new password are required."
            ));
        }

        try {
            passwordResetService.resetPassword(token.trim(), newPassword);
            return ResponseEntity.ok(Map.of(
                "message", "Your password has been reset successfully."
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        }
    }
}
