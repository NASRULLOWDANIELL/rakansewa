package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.Property;
import rakansewa.backend.model.RentalRequest;
import rakansewa.backend.repository.PropertyRepository;
import rakansewa.backend.repository.RentalRequestRepository;

import java.util.List;

@Service
public class RentalRequestService {

    private final RentalRequestRepository rentalRequestRepository;
    private final PropertyRepository propertyRepository;

    public RentalRequestService(RentalRequestRepository rentalRequestRepository,
                                 PropertyRepository propertyRepository) {
        this.rentalRequestRepository = rentalRequestRepository;
        this.propertyRepository = propertyRepository;
    }

    // Create a new rental request linked to a property
    public RentalRequest createRentalRequest(Long propertyId, RentalRequest rentalRequest) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        rentalRequest.setProperty(property);
        return rentalRequestRepository.save(rentalRequest);
    }

    // Get all rental requests
    public List<RentalRequest> getAllRentalRequests() {
        return rentalRequestRepository.findAll();
    }

    // Get a single rental request by ID
    public RentalRequest getRentalRequestById(Long id) {
        return rentalRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental request not found with id: " + id));
    }

    // Get all rental requests for a specific property
    public List<RentalRequest> getRentalRequestsByPropertyId(Long propertyId) {
        return rentalRequestRepository.findByPropertyId(propertyId);
    }

    // Update only the status of a rental request (Pending → Approved / Rejected)
    public RentalRequest updateRequestStatus(Long id, String status) {
        RentalRequest existing = getRentalRequestById(id);
        existing.setRequestStatus(status);
        return rentalRequestRepository.save(existing);
    }
}
