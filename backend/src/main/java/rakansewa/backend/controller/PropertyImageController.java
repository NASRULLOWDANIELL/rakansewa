package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.PropertyImage;
import rakansewa.backend.repository.PropertyImageRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/property-images")
public class PropertyImageController {

    private final PropertyImageRepository propertyImageRepository;

    public PropertyImageController(PropertyImageRepository propertyImageRepository) {
        this.propertyImageRepository = propertyImageRepository;
    }

    // DELETE /property-images/{imageId} — Delete a single image record + physical file
    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        PropertyImage image = propertyImageRepository.findById(imageId).orElse(null);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        // Attempt to delete the physical file from disk
        String imageUrl = image.getImageUrl();
        if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
            try {
                // imageUrl is like "/uploads/property-images/abc123.jpg"
                Path filePath = Paths.get(imageUrl.substring(1)); // strip leading "/"
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log but don't fail — DB record still removed
                System.err.println("Warning: Could not delete file " + imageUrl + " — " + e.getMessage());
            }
        }

        propertyImageRepository.delete(image);
        return ResponseEntity.noContent().build();
    }
}
