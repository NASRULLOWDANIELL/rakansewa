package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.RentalRequest;
import rakansewa.backend.service.RentalRequestService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rental-requests")
public class RentalRequestController {

    private final RentalRequestService rentalRequestService;

    public RentalRequestController(RentalRequestService rentalRequestService) {
        this.rentalRequestService = rentalRequestService;
    }

    // POST /rental-requests?propertyId=1 — Create a rental request for a property
    @PostMapping
    public ResponseEntity<RentalRequest> createRentalRequest(
            @RequestParam Long propertyId,
            @RequestBody RentalRequest rentalRequest) {
        RentalRequest saved = rentalRequestService.createRentalRequest(propertyId, rentalRequest);
        return ResponseEntity.ok(saved);
    }

    // GET /rental-requests — Get all rental requests
    @GetMapping
    public ResponseEntity<List<RentalRequest>> getAllRentalRequests() {
        List<RentalRequest> requests = rentalRequestService.getAllRentalRequests();
        return ResponseEntity.ok(requests);
    }

    // GET /rental-requests/{id} — Get a single rental request
    @GetMapping("/{id}")
    public ResponseEntity<RentalRequest> getRentalRequestById(@PathVariable Long id) {
        RentalRequest request = rentalRequestService.getRentalRequestById(id);
        return ResponseEntity.ok(request);
    }

    // GET /rental-requests/property/{propertyId} — Get all requests for a property
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<RentalRequest>> getRentalRequestsByPropertyId(@PathVariable Long propertyId) {
        List<RentalRequest> requests = rentalRequestService.getRentalRequestsByPropertyId(propertyId);
        return ResponseEntity.ok(requests);
    }

    // PUT /rental-requests/{id}/status — Update request status (Approved/Rejected)
    @PutMapping("/{id}/status")
    public ResponseEntity<RentalRequest> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("requestStatus");
        RentalRequest updated = rentalRequestService.updateRequestStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
