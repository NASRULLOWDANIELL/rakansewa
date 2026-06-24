import { useEffect, useState, useMemo, useCallback } from 'react';
import { getProperties, getUserFavourites, toggleFavourite } from '../services/api';
import PropertyList from '../components/PropertyList';
import PropertyFilter from '../components/PropertyFilter';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';


/* ── Skeleton loader ── */
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <div className="skeleton h-52 w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-5/6" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
      <div className="skeleton h-10 w-full rounded-xl mt-2" />
    </div>
  </div>
);

const PropertiesPage = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setAllProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

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
        if (result.favourited) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    } catch (err) {
      console.error('Error toggling favourite:', err);
    }
  }, [currentUser]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      if (property.approvalStatus !== 'Approved' && property.availabilityStatus !== 'Available') return false;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!property.title?.toLowerCase().includes(query) && !property.city?.toLowerCase().includes(query)) return false;
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

  const availableStates = [...new Set(allProperties.map(p => p.state).filter(Boolean))];
  const availableRoomTypes = [...new Set(allProperties.map(p => p.roomType).filter(Boolean))];
  const availablePropertyTypes = [...new Set(allProperties.map(p => p.propertyType).filter(Boolean))];
  const availableFurnished = [...new Set(allProperties.map(p => p.furnishedStatus).filter(Boolean))];

  const activeFilterCount = [filters.state, filters.roomType, filters.propertyType, filters.furnishedStatus, filters.minPrice, filters.maxPrice, filters.search].filter(Boolean).length;

  return (
    <div className="rs-page pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-on-surface font-headline mb-1">
                {t('prop_title')}
              </h1>
              <p className="text-on-surface-variant text-sm">
                {t('prop_subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-on-surface hover:bg-gray-50 transition-colors shadow-rs-sm"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                {t('prop_filter_toggle')}
                {activeFilterCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Result count pill */}
              {!loading && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-rs-sm">
                  <span className="text-sm font-bold text-on-surface">{filteredProperties.length}</span>
                  <span className="text-sm text-on-surface-variant">{t('nav_properties').toLowerCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-6 animate-fade-in-up">
            <PropertyFilter
              filters={filters}
              setFilters={setFilters}
              availableStates={availableStates}
              availableRoomTypes={availableRoomTypes}
              availablePropertyTypes={availablePropertyTypes}
              availableFurnished={availableFurnished}
              onReset={() => setFilters(initialFilters)}
            />
          </div>
        )}

        <div className="flex gap-7 items-start">
          {/* Sidebar Filters */}
          <aside className="w-68 flex-shrink-0 hidden lg:block sticky top-24">
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

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            {loading ? (
              /* Skeleton Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : error ? (
              /* Error State */
              <div className="rs-empty-state">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-red-400 text-2xl">error_outline</span>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-1">{t('prop_error_title')}</h3>
                <p className="text-on-surface-variant text-sm max-w-xs">{error || t('prop_error_sub')}</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              /* Empty State */
              <div className="rs-empty-state">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">search_off</span>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-1">{t('prop_no_results_title')}</h3>
                <p className="text-on-surface-variant text-sm mb-5 max-w-xs">
                  {activeFilterCount > 0 ? t('prop_results_filtered') : t('prop_no_results_sub')}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(initialFilters)}
                    className="rs-btn-primary text-sm py-2.5 px-6"
                  >
                    {t('prop_clear_filters')}
                  </button>
                )}
              </div>
            ) : (
              <PropertyList
                properties={filteredProperties}
                favouritedIds={favouritedIds}
                onToggleFavourite={currentUser ? handleToggleFavourite : null}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;