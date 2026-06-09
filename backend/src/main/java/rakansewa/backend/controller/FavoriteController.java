package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.Favorite;
import rakansewa.backend.service.FavoriteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /**
     * POST /favorites/toggle — Toggle favourite for a property.
     * Body: { "userEmail": "...", "propertyId": 1 }
     * Returns { "favourited": true/false }
     */
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFavorite(@RequestBody Map<String, Object> body) {
        try {
            String userEmail = (String) body.get("userEmail");
            Long propertyId = Long.valueOf(body.get("propertyId").toString());

            if (userEmail == null || userEmail.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User email is required."));
            }

            Favorite result = favoriteService.toggleFavorite(userEmail, propertyId);
            boolean isFavourited = result != null;
            return ResponseEntity.ok(Map.of("favourited", isFavourited));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /favorites/user/{email} — Get all favourites for a user.
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<List<Favorite>> getFavoritesByUser(@PathVariable String email) {
        List<Favorite> favorites = favoriteService.getFavoritesByUserEmail(email);
        return ResponseEntity.ok(favorites);
    }

    // POST /favorites?propertyId=1 — Add a property to favorites (legacy)
    @PostMapping
    public ResponseEntity<Favorite> addFavorite(
            @RequestParam Long propertyId,
            @RequestBody Favorite favorite) {
        Favorite saved = favoriteService.addFavorite(propertyId, favorite);
        return ResponseEntity.ok(saved);
    }

    // GET /favorites — Get all favorites
    @GetMapping
    public ResponseEntity<List<Favorite>> getAllFavorites() {
        List<Favorite> favorites = favoriteService.getAllFavorites();
        return ResponseEntity.ok(favorites);
    }

    // GET /favorites/property/{propertyId} — Get favorites for a property
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Favorite>> getFavoritesByPropertyId(@PathVariable Long propertyId) {
        List<Favorite> favorites = favoriteService.getFavoritesByPropertyId(propertyId);
        return ResponseEntity.ok(favorites);
    }
}
