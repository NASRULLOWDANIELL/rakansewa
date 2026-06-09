import { useEffect, useState, useMemo, useCallback } from 'react';
import { getProperties, getUserFavourites, toggleFavourite } from '../services/api';
import PropertyList from '../components/PropertyList';
import PropertyFilter from '../components/PropertyFilter';
import { useAuth } from '../context/AuthContext';

const PropertiesPage = () => {
  const { currentUser } = useAuth();

  const initialFilters = {
    search: '',
    state: '',
    roomType: '',
    propertyType: '',
    furnishedStatus: '',
    minPrice: '',
    maxPrice: ''
  };

  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [favouritedIds, setFavouritedIds] = useState(new Set());

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setAllProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Make sure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Fetch user's favourites
  useEffect(() => {
    if (!currentUser?.email) return;
    const fetchFavourites = async () => {
      try {
        const favs = await getUserFavourites(currentUser.email);
        const ids = new Set(favs.map(f => f.property?.id).filter(Boolean));
        setFavouritedIds(ids);
      } catch (err) {
        console.error('Error fetching favourites:', err);
      }
    };
    fetchFavourites();
  }, [currentUser]);

  const handleToggleFavourite = useCallback(async (propertyId) => {
    if (!currentUser?.email) return;
    try {
      const result = await toggleFavourite(currentUser.email, propertyId);
      setFavouritedIds(prev => {
        const next = new Set(prev);
        if (result.favourited) {
          next.add(propertyId);
        } else {
          next.delete(propertyId);
        }
        return next;
      });
    } catch (err) {
      console.error('Error toggling favourite:', err);
    }
  }, [currentUser]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      // Only show Approved/Available properties to students/public
      if (property.approvalStatus !== 'Approved' && property.availabilityStatus !== 'Available') return false;

      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (
          !property.title?.toLowerCase().includes(query) &&
          !property.city?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.state && property.state !== filters.state) return false;
      if (filters.roomType && property.roomType !== filters.roomType) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      if (filters.furnishedStatus && property.furnishedStatus !== filters.furnishedStatus) return false;

      if (filters.minPrice && property.monthlyRent < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && property.monthlyRent > parseFloat(filters.maxPrice)) return false;

      return true;
    });
  }, [allProperties, filters]);

  const availableStates = [...new Set(allProperties.map((p) => p.state).filter(Boolean))];
  const availableRoomTypes = [...new Set(allProperties.map((p) => p.roomType).filter(Boolean))];
  const availablePropertyTypes = [...new Set(allProperties.map((p) => p.propertyType).filter(Boolean))];
  const availableFurnished = [...new Set(allProperties.map((p) => p.furnishedStatus).filter(Boolean))];

  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading properties...</div>;
  if (error) return <div className="text-center py-32 text-error text-lg font-medium">{error}</div>;

  return (
    <main className="flex-grow max-w-7xl mx-auto w-full px-8 py-12 pt-32 flex gap-12 relative items-start">
      {/* Filters Sidebar */}
      <aside className="w-72 flex-shrink-0 hidden lg:block sticky top-32 h-fit mb-12">
        <PropertyFilter
          filters={filters}
          setFilters={setFilters}
          availableStates={availableStates}
          availableRoomTypes={availableRoomTypes}
          availablePropertyTypes={availablePropertyTypes}
          availableFurnished={availableFurnished}
          onReset={() => setFilters(initialFilters)}
        />
      </aside>
      
      {/* Main Content Area */}
      <section className="flex-grow w-full">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">Student Housing</h1>
            <p className="text-on-surface-variant font-body">Showing {filteredProperties.length} verified {filteredProperties.length === 1 ? 'property' : 'properties'} near you</p>
          </div>
        </header>

        <PropertyList
          properties={filteredProperties}
          favouritedIds={favouritedIds}
          onToggleFavourite={currentUser ? handleToggleFavourite : null}
        />
      </section>
    </main>
  );
};

export default PropertiesPage;