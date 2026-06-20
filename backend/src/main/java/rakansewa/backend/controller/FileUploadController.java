package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rakansewa.backend.model.Property;
import rakansewa.backend.model.PropertyImage;
import rakansewa.backend.repository.PropertyImageRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/property-images";
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;

    public FileUploadController(PropertyRepository propertyRepository,
                                PropertyImageRepository propertyImageRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
    }

    // ── Existing single-file endpoint (kept for backward compatibility) ──────────
    @PostMapping("/property-image")
    public ResponseEntity<?> uploadPropertyImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No file selected."));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed."));
            }

            // Create directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString().substring(0, 12) + extension;

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the public URL path
            String imageUrl = "/" + UPLOAD_DIR + "/" + newFilename;
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload image."));
        }
    }

    // ── Multi-file endpoint — uploads multiple images for a property ───────────
    // @Transactional: keeps findById, getReferenceById, and all saves in ONE session
    //   so the Property proxy stays managed and Hibernate never has to flush-check
    //   the EAGER images collection (which would trigger circular hashCode via @Data).
    @Transactional
    @PostMapping("/property-images/{propertyId}")
    public ResponseEntity<?> uploadPropertyImages(
            @PathVariable Long propertyId,
            @RequestParam("files") List<MultipartFile> files) {

        // existsById: lightweight COUNT query — does NOT load the Property entity
        // (avoids pulling in the EAGER images list that caused StackOverflow during flush)
        if (!propertyRepository.existsById(propertyId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Property not found."));
        }

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No files provided."));
        }

        // Validate all files before writing anything to disk
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "One or more files are empty."));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Only image files are allowed. \"" + file.getOriginalFilename() + "\" is not a valid image."));
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            boolean validExt = ALLOWED_EXTENSIONS.stream().anyMatch(originalFilename::endsWith);
            if (!validExt) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Invalid file type for \"" + file.getOriginalFilename() + "\". Allowed: JPG, JPEG, PNG, WebP."));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "\"" + file.getOriginalFilename() + "\" exceeds the 5MB size limit."));
            }
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // getReferenceById: returns a Hibernate proxy using only the ID as FK.
            // The full Property entity (and its images list) is NEVER loaded, so
            // Hibernate never needs to hashCode() the existing images during flush.
            Property propertyRef = propertyRepository.getReferenceById(propertyId);

            List<Map<String, String>> results = new ArrayList<>();

            for (MultipartFile file : files) {
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
                }
                String newFilename = UUID.randomUUID().toString().substring(0, 12) + extension;

                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                String imageUrl = "/" + UPLOAD_DIR + "/" + newFilename;

                PropertyImage img = new PropertyImage();
                img.setImageUrl(imageUrl);
                img.setProperty(propertyRef);   // proxy reference — only sets property_id FK
                propertyImageRepository.save(img);

                results.add(Map.of("imageUrl", imageUrl));
            }

            return ResponseEntity.ok(results);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload images."));
        }
    }
}
