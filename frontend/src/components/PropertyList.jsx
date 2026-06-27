import PropertyCard from './PropertyCard';
import { useLanguage } from '../context/LanguageContext';

const PropertyList = ({ properties, favouritedIds = new Set(), onToggleFavourite }) => {
  const { t } = useLanguage();

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant font-medium text-lg">
        {t('prop_no_properties_avail')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6 md:gap-8">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavourited={favouritedIds.has(property.id)}
          onToggleFavourite={onToggleFavourite}
        />
      ))}
    </div>
  );
};

export default PropertyList;
