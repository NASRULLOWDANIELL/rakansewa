package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.PropertyRepository;

import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    // Create a new property listing
    public Property createProperty(Property property) {
        property.setApprovalStatus("Pending");
        property.setVerificationStatus(Property.VerificationStatus.PENDING);
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

        // Preserve approvalStatus and rejectionReason from the incoming payload
        if (updatedProperty.getApprovalStatus() != null) {
            existing.setApprovalStatus(updatedProperty.getApprovalStatus());
            if (updatedProperty.getApprovalStatus().equals("Approved")) existing.setVerificationStatus(Property.VerificationStatus.APPROVED);
            else if (updatedProperty.getApprovalStatus().equals("Rejected")) existing.setVerificationStatus(Property.VerificationStatus.REJECTED);
            else existing.setVerificationStatus(Property.VerificationStatus.PENDING);
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
        existing.setVerificationStatus(Property.VerificationStatus.APPROVED);
        existing.setAvailabilityStatus("Available");
        existing.setRejectionReason(null);
        return propertyRepository.save(existing);
    }

    // Admin rejects a property with a reason
    public Property rejectProperty(Long id, String reason) {
        Property existing = getPropertyById(id);
        existing.setApprovalStatus("Rejected");
        existing.setVerificationStatus(Property.VerificationStatus.REJECTED);
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

        // Reset approval state
        existing.setApprovalStatus("Pending");
        existing.setVerificationStatus(Property.VerificationStatus.PENDING);
        existing.setAvailabilityStatus("Pending");
        existing.setRejectionReason(null);

        return propertyRepository.save(existing);
    }

    // Delete a property by ID
    public void deleteProperty(Long id) {
        Property existing = getPropertyById(id); // throws if not found
        propertyRepository.delete(existing);
    }
}
