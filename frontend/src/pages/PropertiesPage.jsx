import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { getProperties, getUserFavourites, toggleFavourite } from '../services/api';
import PropertyList from '../components/PropertyList';
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

/* ── Top horizontal filter bar ── */
const TopFilterBar = ({
  filters,
  setFilters,
  availableStates,
  availableRoomTypes,
  availablePropertyTypes,
  availableFurnished,
  onReset,
  activeFilterCount,
  t,
}) => {
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const priceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setShowPriceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="sticky top-16 z-40 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/80 shadow-rs-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-2.5">

          {/* Search bar styled as a pill */}
          <div className="relative flex-shrink-0 w-56">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-on-surface-variant/60 pointer-events-none">search</span>
            <input
              type="text"
              name="search"
              placeholder={t('pfilter_search_placeholder')}
              value={filters.search}
              onChange={handleChange}
              className="rs-pill rs-pill-inactive w-full pl-10 pr-4 text-xs font-semibold"
              style={{ paddingLeft: '36px', height: '36px' }}
            />
          </div>

          {/* Location Dropdown Pill */}
          {availableStates.length > 0 && (
            <div className="relative flex-shrink-0">
              <select
                name="state"
                value={filters.state}
                onChange={handleChange}
                className={`rs-pill appearance-none pr-8 text-xs cursor-pointer font-semibold ${
                  filters.state ? 'rs-pill-active' : 'rs-pill-inactive'
                }`}
                style={{ height: '36px', paddingRight: '28px' }}
              >
                <option value="">{t('filter_location')}</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{t(state)}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-bold ${
                filters.state ? 'text-white' : 'text-on-surface-variant'
              }`}>expand_more</span>
            </div>
          )}

          {/* Property Type Dropdown Pill */}
          {availablePropertyTypes.length > 0 && (
            <div className="relative flex-shrink-0">
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleChange}
                className={`rs-pill appearance-none pr-8 text-xs cursor-pointer font-semibold ${
                  filters.propertyType ? 'rs-pill-active' : 'rs-pill-inactive'
                }`}
                style={{ height: '36px', paddingRight: '28px' }}
              >
                <option value="">{t('filter_type')}</option>
                {availablePropertyTypes.map(type => (
                  <option key={type} value={type}>{t(type)}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-bold ${
                filters.propertyType ? 'text-white' : 'text-on-surface-variant'
              }`}>expand_more</span>
            </div>
          )}

          {/* Room Type Dropdown Pill */}
          {availableRoomTypes.length > 0 && (
            <div className="relative flex-shrink-0">
              <select
                name="roomType"
                value={filters.roomType}
                onChange={handleChange}
                className={`rs-pill appearance-none pr-8 text-xs cursor-pointer font-semibold ${
                  filters.roomType ? 'rs-pill-active' : 'rs-pill-inactive'
                }`}
                style={{ height: '36px', paddingRight: '28px' }}
              >
                <option value="">{t('filter_room')}</option>
                {availableRoomTypes.map(type => (
                  <option key={type} value={type}>{t(type)}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-bold ${
                filters.roomType ? 'text-white' : 'text-on-surface-variant'
              }`}>expand_more</span>
            </div>
          )}

          {/* Furnishing Dropdown Pill */}
          {availableFurnished.length > 0 && (
            <div className="relative flex-shrink-0">
              <select
                name="furnishedStatus"
                value={filters.furnishedStatus}
                onChange={handleChange}
                className={`rs-pill appearance-none pr-8 text-xs cursor-pointer font-semibold ${
                  filters.furnishedStatus ? 'rs-pill-active' : 'rs-pill-inactive'
                }`}
                style={{ height: '36px', paddingRight: '28px' }}
              >
                <option value="">{t('pfilter_furnishing')}</option>
                {availableFurnished.map(status => (
                  <option key={status} value={status}>{t(status)}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-bold ${
                filters.furnishedStatus ? 'text-white' : 'text-on-surface-variant'
              }`}>expand_more</span>
            </div>
          )}

          {/* Price Range Popover Pill */}
          <div className="relative flex-shrink-0" ref={priceRef}>
            <button
              type="button"
              onClick={() => setShowPriceDropdown(!showPriceDropdown)}
              className={`rs-pill flex items-center gap-1.5 text-xs font-semibold ${
                filters.minPrice || filters.maxPrice ? 'rs-pill-active' : 'rs-pill-inactive'
              }`}
              style={{ height: '36px' }}
            >
              <span>
                {filters.minPrice || filters.maxPrice
                  ? `Price: RM${filters.minPrice || 0} - ${filters.maxPrice ? 'RM' + filters.maxPrice : 'Max'}`
                  : t('filter_price')}
              </span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>

            {showPriceDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-rs-lg p-4 z-50 animate-slide-down">
                <h4 className="font-bold text-xs text-on-surface mb-2">{t('filter_price')}</h4>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant">RM</span>
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleChange}
                      placeholder={t('filter_min')}
                      className="rs-input pl-8 text-xs h-9 py-0 w-full"
                      style={{ paddingLeft: '32px', height: '36px' }}
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">–</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant">RM</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleChange}
                      placeholder={t('filter_max')}
                      className="rs-input pl-8 text-xs h-9 py-0 w-full"
                      style={{ paddingLeft: '32px', height: '36px' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                    className="text-[10px] font-bold text-on-surface-variant hover:text-red-500 transition-colors"
                  >
                    {t('filter_clear')}
                  </button>
                  <button
                    onClick={() => setShowPriceDropdown(false)}
                    className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('filter_apply')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active filters badge + clear */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                <span className="material-symbols-outlined text-[11px]">filter_list</span>
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
              </span>
              <button
                onClick={onReset}
                className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                {t('filter_clear')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

      {/* ── Top Filter Bar ── */}
      <TopFilterBar
        filters={filters}
        setFilters={setFilters}
        availableStates={availableStates}
        availableRoomTypes={availableRoomTypes}
        availablePropertyTypes={availablePropertyTypes}
        availableFurnished={availableFurnished}
        onReset={() => setFilters(initialFilters)}
        activeFilterCount={activeFilterCount}
        t={t}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface font-headline mb-1">
              {t('prop_title')}
            </h1>
            <p className="text-on-surface-variant text-sm">
              {t('prop_subtitle')}
            </p>
          </div>
          {/* Result count pill */}
          {!loading && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-rs-sm flex-shrink-0">
              <span className="text-sm font-bold text-on-surface">{filteredProperties.length}</span>
              <span className="text-sm text-on-surface-variant">{t('nav_properties').toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Full-width Content */}
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
      </div>
    </div>
  );
};

export default PropertiesPage;