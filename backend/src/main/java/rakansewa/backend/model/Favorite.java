package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    // Many favorites can belong to one property
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
}
