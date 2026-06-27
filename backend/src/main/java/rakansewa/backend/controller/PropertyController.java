package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.Property;
import rakansewa.backend.model.PropertyUpdate;
import rakansewa.backend.service.PropertyService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // POST /properties — Create a new property listing
    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        Property saved = propertyService.createProperty(property);
        return ResponseEntity.ok(saved);
    }

    // GET /properties — Get all property listings
    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        List<Property> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }

    // GET /properties/owner/{ownerId} — Get all properties for a specific owner
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Property>> getPropertiesByOwner(@PathVariable Long ownerId) {
        List<Property> properties = propertyService.getPropertiesByOwner(ownerId);
        return ResponseEntity.ok(properties);
    }

    // GET /properties/{id} — Get a single property by ID
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        Property property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(property);
    }

    // PUT /properties/{id} — Update a property listing
    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id, @RequestBody Property property) {
        Property updated = propertyService.updateProperty(id, property);
        return ResponseEntity.ok(updated);
    }

    // PUT /properties/{id}/approve — Admin approves a property
    @PutMapping("/{id}/approve")
    public ResponseEntity<Property> approveProperty(@PathVariable Long id) {
        Property approved = propertyService.approveProperty(id);
        return ResponseEntity.ok(approved);
    }

    // PUT /properties/{id}/reject — Admin rejects a property with a reason
    @PutMapping("/{id}/reject")
    public ResponseEntity<Property> rejectProperty(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        Property rejected = propertyService.rejectProperty(id, reason);
        return ResponseEntity.ok(rejected);
    }

    // PUT /properties/{id}/resubmit — Owner resubmits after editing a rejected property
    @PutMapping("/{id}/resubmit")
    public ResponseEntity<Property> resubmitProperty(@PathVariable Long id, @RequestBody Property property) {
        Property resubmitted = propertyService.resubmitProperty(id, property);
        return ResponseEntity.ok(resubmitted);
    }

    // GET /properties/approved — Get only approved properties (for dropdown selection)
    @GetMapping("/approved")
    public ResponseEntity<List<Property>> getApprovedProperties() {
        List<Property> approved = propertyService.getAllProperties().stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApprovalStatus()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(approved);
    }

    // DELETE /properties/{id} — Delete a property listing
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }

    // GET /properties/updates — Get all historical updates
    @GetMapping("/updates")
    public ResponseEntity<List<PropertyUpdate>> getAllPropertyUpdates() {
        List<PropertyUpdate> updates = propertyService.getAllPropertyUpdates();
        return ResponseEntity.ok(updates);
    }
}
