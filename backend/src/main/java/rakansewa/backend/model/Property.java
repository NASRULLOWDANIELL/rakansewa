package rakansewa.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
@EqualsAndHashCode(exclude = "images") // prevents circular hashCode: Property → images → PropertyImage → Property
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private Double monthlyRent;

    @Column(nullable = false)
    private String roomType; // e.g. "Single", "Master", "Middle"

    @Column(nullable = false)
    private String propertyType; // e.g. "Apartment", "Terrace", "Condo"

    @Column(nullable = false)
    private String furnishedStatus; // e.g. "Fully Furnished", "Partially", "Unfurnished"

    @Column(nullable = false)
    private String availabilityStatus; // e.g. "Available", "Occupied"

    @Column
    private Long ownerId;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(nullable = false)
    private String approvalStatus = "Pending"; // "Pending", "Approved", "Rejected"

    @Column(columnDefinition = "TEXT")
    private String rejectionReason; // reason provided by admin when rejecting

    // Multiple images — one-to-many relationship with PropertyImage
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PropertyImage> images = new ArrayList<>();
}
