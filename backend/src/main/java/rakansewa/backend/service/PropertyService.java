package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rakansewa.backend.model.Property;
import rakansewa.backend.model.PropertyUpdate;
import rakansewa.backend.repository.PropertyImageRepository;
import rakansewa.backend.repository.PropertyRepository;
import rakansewa.backend.repository.PropertyUpdateRepository;

import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyUpdateRepository propertyUpdateRepository;

    public PropertyService(PropertyRepository propertyRepository, PropertyImageRepository propertyImageRepository, PropertyUpdateRepository propertyUpdateRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.propertyUpdateRepository = propertyUpdateRepository;
    }

    // Create a new property listing
    public Property createProperty(Property property) {
        property.setApprovalStatus("Pending");
        property.setRejectionReason(null);
        return propertyRepository.save(property);
    }

    // Get all property listings
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    // Get properties by owner ID
    public List<Property> getPropertiesByOwner(Long ownerId) {
        return propertyRepository.findByOwnerId(ownerId);
    }

    // Get a single property by ID
    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
    }

    // Update an existing property
    public Property updateProperty(Long id, Property updatedProperty) {
        Property existing = getPropertyById(id);

        // Generate change log if the property was already approved
        if ("Approved".equalsIgnoreCase(existing.getApprovalStatus())) {
            java.util.List<String> changes = new java.util.ArrayList<>();
            if (!java.util.Objects.equals(existing.getTitle(), updatedProperty.getTitle())) {
                changes.add("Title: '" + existing.getTitle() + "' → '" + updatedProperty.getTitle() + "'");
            }
            if (!java.util.Objects.equals(existing.getDescription(), updatedProperty.getDescription())) {
                changes.add("Description updated");
            }
            if (!java.util.Objects.equals(existing.getAddress(), updatedProperty.getAddress())) {
                changes.add("Address updated");
            }
            if (!java.util.Objects.equals(existing.getMonthlyRent(), updatedProperty.getMonthlyRent())) {
                changes.add("Rent: RM " + existing.getMonthlyRent() + " → RM " + updatedProperty.getMonthlyRent());
            }
            if (!java.util.Objects.equals(existing.getRoomType(), updatedProperty.getRoomType())) {
                changes.add("Room Type: '" + existing.getRoomType() + "' → '" + updatedProperty.getRoomType() + "'");
            }
            if (!java.util.Objects.equals(existing.getPropertyType(), updatedProperty.getPropertyType())) {
                changes.add("Property Type: '" + existing.getPropertyType() + "' → '" + updatedProperty.getPropertyType() + "'");
            }
            if (!java.util.Objects.equals(existing.getFurnishedStatus(), updatedProperty.getFurnishedStatus())) {
                changes.add("Furnished Status: '" + existing.getFurnishedStatus() + "' → '" + updatedProperty.getFurnishedStatus() + "'");
            }
            if (!java.util.Objects.equals(existing.getAmenities(), updatedProperty.getAmenities())) {
                String oldAmen = existing.getAmenities() == null || existing.getAmenities().isEmpty() ? "None" : existing.getAmenities();
                String newAmen = updatedProperty.getAmenities() == null || updatedProperty.getAmenities().isEmpty() ? "None" : updatedProperty.getAmenities();
                changes.add("Amenities: [" + oldAmen + "] → [" + newAmen + "]");
            }

            String finalLog;
            if (!changes.isEmpty()) {
                finalLog = String.join("; ", changes);
            } else {
                finalLog = "No field changes detected (possibly updated images only)";
            }
            existing.setChangeLog(finalLog);
            existing.setUpdatedAt(java.time.LocalDateTime.now());

            // Add a new historical entry instead of just overriding the property's change log
            PropertyUpdate propUpdate = PropertyUpdate.builder()
                .propertyId(existing.getId())
                .title(updatedProperty.getTitle() != null ? updatedProperty.getTitle() : existing.getTitle())
                .imageUrl(updatedProperty.getImageUrl() != null ? updatedProperty.getImageUrl() : existing.getImageUrl())
                .city(updatedProperty.getCity() != null ? updatedProperty.getCity() : existing.getCity())
                .state(updatedProperty.getState() != null ? updatedProperty.getState() : existing.getState())
                .changeLog(finalLog)
                .updatedAt(java.time.LocalDateTime.now())
                .build();
            propertyUpdateRepository.save(propUpdate);
        }

        existing.setTitle(updatedProperty.getTitle());
        existing.setDescription(updatedProperty.getDescription());
        existing.setAddress(updatedProperty.getAddress());
        existing.setCity(updatedProperty.getCity());
        existing.setState(updatedProperty.getState());
        existing.setMonthlyRent(updatedProperty.getMonthlyRent());
        existing.setRoomType(updatedProperty.getRoomType());
        existing.setPropertyType(updatedProperty.getPropertyType());
        existing.setFurnishedStatus(updatedProperty.getFurnishedStatus());
        existing.setAvailabilityStatus(updatedProperty.getAvailabilityStatus());
        existing.setOwnerId(updatedProperty.getOwnerId());
        existing.setImageUrl(updatedProperty.getImageUrl());
        existing.setLatitude(updatedProperty.getLatitude());
        existing.setLongitude(updatedProperty.getLongitude());
        existing.setAmenities(updatedProperty.getAmenities());

        // Prevent Approved status from reverting back to Pending due to Jackson defaults
        if ("Approved".equalsIgnoreCase(existing.getApprovalStatus())) {
            existing.setApprovalStatus("Approved");
        } else {
            if (updatedProperty.getApprovalStatus() != null) {
                existing.setApprovalStatus(updatedProperty.getApprovalStatus());
            }
        }

        if (updatedProperty.getRejectionReason() != null) {
            existing.setRejectionReason(updatedProperty.getRejectionReason());
        }

        return propertyRepository.save(existing);
    }

    // Admin approves a property
    public Property approveProperty(Long id) {
        Property existing = getPropertyById(id);
        existing.setApprovalStatus("Approved");
        existing.setAvailabilityStatus("Available");
        existing.setRejectionReason(null);
        return propertyRepository.save(existing);
    }

    // Admin rejects a property with a reason
    public Property rejectProperty(Long id, String reason) {
        Property existing = getPropertyById(id);
        existing.setApprovalStatus("Rejected");
        existing.setAvailabilityStatus("Rejected");
        existing.setRejectionReason(reason);
        return propertyRepository.save(existing);
    }

    // Owner resubmits a rejected property after editing
    public Property resubmitProperty(Long id, Property updatedProperty) {
        Property existing = getPropertyById(id);

        existing.setTitle(updatedProperty.getTitle());
        existing.setDescription(updatedProperty.getDescription());
        existing.setAddress(updatedProperty.getAddress());
        existing.setCity(updatedProperty.getCity());
        existing.setState(updatedProperty.getState());
        existing.setMonthlyRent(updatedProperty.getMonthlyRent());
        existing.setRoomType(updatedProperty.getRoomType());
        existing.setPropertyType(updatedProperty.getPropertyType());
        existing.setFurnishedStatus(updatedProperty.getFurnishedStatus());
        existing.setOwnerId(updatedProperty.getOwnerId());
        existing.setImageUrl(updatedProperty.getImageUrl());
        existing.setLatitude(updatedProperty.getLatitude());
        existing.setLongitude(updatedProperty.getLongitude());
        existing.setAmenities(updatedProperty.getAmenities());

        // Reset approval state
        existing.setApprovalStatus("Pending");
        existing.setAvailabilityStatus("Pending");
        existing.setRejectionReason(null);
        existing.setUpdatedAt(null);

        return propertyRepository.save(existing);
    }

    // Delete a property by ID (images cascade-deleted via JPA; explicit delete for safety)
    @Transactional
    public void deleteProperty(Long id) {
        Property existing = getPropertyById(id); // throws if not found
        propertyImageRepository.deleteByPropertyId(id);
        propertyRepository.delete(existing);
    }

    // Get all historical updates
    public List<PropertyUpdate> getAllPropertyUpdates() {
        return propertyUpdateRepository.findAllByOrderByUpdatedAtDesc();
    }
}
