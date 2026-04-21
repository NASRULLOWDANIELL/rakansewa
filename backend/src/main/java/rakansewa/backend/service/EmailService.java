package rakansewa.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("RakanSewa - Password Reset Request");
        message.setText(
            "You requested a password reset for RakanSewa.\n\n" +
            "Click the link below to reset your password:\n" +
            resetLink + "\n\n" +
            "This link will expire in 30 minutes.\n\n" +
            "If you did not request this, please ignore this email."
        );

        try {
            logger.info("Attempting to send password reset email to: {}", toEmail);
            mailSender.send(message);
            logger.info("Successfully sent password reset email to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to: {}. Error details: {}", toEmail, e.getMessage(), e);
            throw e; // Rethrow to maintain existing flow
        }
    }
}
