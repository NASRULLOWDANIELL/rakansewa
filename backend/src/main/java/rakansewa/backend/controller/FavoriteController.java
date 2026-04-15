package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.Favorite;
import rakansewa.backend.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    // POST /favorites?propertyId=1 — Add a property to favorites
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
