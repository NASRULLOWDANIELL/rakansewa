package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.Favorite;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.FavoriteRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           PropertyRepository propertyRepository) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
    }

    /**
     * Toggle a favourite: if it exists, remove it; if not, add it.
     * Returns the favourite if added, or null if removed.
     */
    public Favorite toggleFavorite(String userEmail, Long propertyId) {
        Optional<Favorite> existing = favoriteRepository.findByUserEmailAndPropertyId(userEmail, propertyId);

        if (existing.isPresent()) {
            // Already favourited — remove it
            favoriteRepository.delete(existing.get());
            return null;
        } else {
            // Not favourited — add it
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

            Favorite favorite = new Favorite();
            favorite.setUserEmail(userEmail);
            favorite.setProperty(property);
            return favoriteRepository.save(favorite);
        }
    }

    // Add a property to favorites
    public Favorite addFavorite(Long propertyId, Favorite favorite) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        favorite.setProperty(property);
        return favoriteRepository.save(favorite);
    }

    // Get all favorites
    public List<Favorite> getAllFavorites() {
        return favoriteRepository.findAll();
    }

    // Get all favorites for a specific property
    public List<Favorite> getFavoritesByPropertyId(Long propertyId) {
        return favoriteRepository.findByPropertyId(propertyId);
    }

    // Get all favorites for a specific user
    public List<Favorite> getFavoritesByUserEmail(String userEmail) {
        return favoriteRepository.findByUserEmail(userEmail);
    }
}
