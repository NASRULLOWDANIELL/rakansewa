import PropertyCard from './PropertyCard';

const PropertyList = ({ properties, favouritedIds = new Set(), onToggleFavourite }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant font-medium text-lg">
        No properties available yet. Please check back later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-x-8 gap-y-12">
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
