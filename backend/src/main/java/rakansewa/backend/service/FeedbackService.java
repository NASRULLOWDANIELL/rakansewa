package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.Feedback;
import rakansewa.backend.model.User;
import rakansewa.backend.repository.FeedbackRepository;
import rakansewa.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public Feedback submitFeedback(Feedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setIsResolved(false);
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedbacks() {
        List<Feedback> feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
        for (Feedback f : feedbacks) {
            userRepository.findById(f.getUserId()).ifPresent(u -> f.setUserName(u.getName()));
        }
        return feedbacks;
    }

    public Feedback resolveFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedback.setIsResolved(true);
        return feedbackRepository.save(feedback);
    }
}
