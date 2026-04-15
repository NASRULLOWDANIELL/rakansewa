package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rental_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String studentEmail;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String requestStatus; // e.g. "Pending", "Approved", "Rejected"

    @Column(nullable = false)
    private LocalDateTime requestDate;

    // Many rental requests can belong to one property
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // Auto-set requestDate and default status before saving
    @PrePersist
    public void prePersist() {
        if (this.requestDate == null) {
            this.requestDate = LocalDateTime.now();
        }
        if (this.requestStatus == null) {
            this.requestStatus = "Pending";
        }
    }
}
