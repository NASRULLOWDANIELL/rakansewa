package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.Property;
import rakansewa.backend.service.PropertyService;

import java.util.Map;

@RestController
@RequestMapping("/admin/properties")
public class AdminPropertyController {

    private final PropertyService propertyService;

    public AdminPropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // PUT /admin/properties/{id}/approve — Admin approves a property
    @PutMapping("/{id}/approve")
    public ResponseEntity<Property> approveProperty(@PathVariable Long id) {
        Property approved = propertyService.approveProperty(id);
        return ResponseEntity.ok(approved);
    }

    // PUT /admin/properties/{id}/reject — Admin rejects a property with a reason
    @PutMapping("/{id}/reject")
    public ResponseEntity<Property> rejectProperty(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        Property rejected = propertyService.rejectProperty(id, reason);
        return ResponseEntity.ok(rejected);
    }
}
