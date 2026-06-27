package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.PropertyImageRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;

    public PropertyService(PropertyRepository propertyRepository, PropertyImageRepository propertyImageRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
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

        // Preserve approvalStatus and rejectionReason from the incoming payload
        if (updatedProperty.getApprovalStatus() != null) {
            existing.setApprovalStatus(updatedProperty.getApprovalStatus());
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

        // Reset approval state
        existing.setApprovalStatus("Pending");
        existing.setAvailabilityStatus("Pending");
        existing.setRejectionReason(null);

        return propertyRepository.save(existing);
    }

    // Delete a property by ID (images cascade-deleted via JPA; explicit delete for
    // safety)
    @Transactional
    public void deleteProperty(Long id) {
        Property existing = getPropertyById(id); // throws if not found
        propertyImageRepository.deleteByPropertyId(id);
        propertyRepository.delete(existing);
    }
}
