package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_updates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyUpdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long propertyId;

    @Column(nullable = false)
    private String title;

    private String imageUrl;

    private String city;

    private String state;

    @Column(columnDefinition = "TEXT")
    private String changeLog;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
