import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PropertyCard = ({ property, isFavourited = false, onToggleFavourite }) => {
  const { t } = useLanguage();
  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70`;
  const rawImage = property.imageUrl || placeholderImage;
  const displayImage = rawImage.startsWith('/uploads') ? `http://localhost:8080${rawImage}` : rawImage;

  const handleFavouriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavourite) onToggleFavourite(property.id);
  };

  const isAvailable = property.availabilityStatus === 'Available';

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-rs-sm hover:shadow-rs-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">

      {/* Image Section */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={property.title}
          src={displayImage}
          loading="lazy"
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
            isAvailable
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-700/80 text-white'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {isAvailable ? t('common_available') : (property.availabilityStatus === 'Occupied' ? t('common_occupied') : property.availabilityStatus)}
          </span>
        </div>

        {/* Favourite Button */}
        <button
          onClick={handleFavouriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isFavourited
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-400 hover:scale-105'
          }`}
          title={isFavourited ? t('card_tooltip_unsave') : t('card_tooltip_save')}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={isFavourited ? { fontVariationSettings: "'FILL' 1" } : {}}
          >favorite</span>
        </button>

        {/* Property type chip */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-on-surface text-base leading-snug line-clamp-1 font-headline group-hover:text-primary transition-colors duration-200"
              title={property.title}
            >
              {property.title}
            </h3>
            <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-base text-on-surface-variant/70">location_on</span>
              {property.city}, {property.state}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="block text-lg font-black text-primary font-headline">RM {property.monthlyRent}</span>
            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">{t('common_per_month')}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-4 flex-1 min-h-[2.5rem]">
          {property.description || `${property.furnishedStatus} ${property.roomType?.toLowerCase()} room ready for viewing.`}
        </p>

        {/* Amenity Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-on-surface-variant px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-xs">bed</span>
            {property.roomType}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-on-surface-variant px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-xs">chair</span>
            {property.furnishedStatus}
          </span>
        </div>

        {/* CTA */}
        <Link
          to={`/properties/${property.id}`}
          className="w-full py-2.5 text-center text-sm font-bold text-primary bg-primary/8 hover:bg-primary hover:text-white rounded-xl transition-all duration-200 border border-primary/20 hover:border-primary hover:shadow-rs-blue"
          style={{ background: 'rgba(0, 88, 190, 0.06)' }}
        >
          {t('card_view')}
        </Link>
      </div>
    </article>
  );
};

export default PropertyCard;
