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
        return propertyRepository.save(property);
    }

    // Get all property listings
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
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

        return propertyRepository.save(existing);
    }

    // Delete a property by ID
    public void deleteProperty(Long id) {
        Property existing = getPropertyById(id); // throws if not found
        propertyRepository.delete(existing);
    }
}
