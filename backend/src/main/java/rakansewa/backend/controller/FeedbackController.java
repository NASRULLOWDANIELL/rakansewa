package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.Feedback;
import rakansewa.backend.service.FeedbackService;

import java.util.List;

@RestController
@RequestMapping("/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        return ResponseEntity.ok(feedbackService.submitFeedback(feedback));
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Feedback> resolveFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.resolveFeedback(id));
    }
}
