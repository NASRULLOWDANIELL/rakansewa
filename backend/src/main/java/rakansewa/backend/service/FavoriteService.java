package rakansewa.backend.service;

import org.springframework.stereotype.Service;
import rakansewa.backend.model.Favorite;
import rakansewa.backend.model.Property;
import rakansewa.backend.repository.FavoriteRepository;
import rakansewa.backend.repository.PropertyRepository;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           PropertyRepository propertyRepository) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
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
}
