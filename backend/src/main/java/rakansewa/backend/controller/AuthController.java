package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.service.PasswordResetService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final PasswordResetService passwordResetService;

    public AuthController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
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
