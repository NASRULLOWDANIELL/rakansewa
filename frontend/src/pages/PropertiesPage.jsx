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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const priceRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setShowPriceDropdown(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setShowMoreFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryClick = (category) => {
    if (category === 'all') {
      setFilters(prev => ({ ...prev, propertyType: '', roomType: '' }));
    } else if (category === 'landed') {
      setFilters(prev => ({ ...prev, propertyType: 'Terrace', roomType: '' }));
    } else if (category === 'apartment') {
      setFilters(prev => ({ ...prev, propertyType: 'Apartment', roomType: '' }));
    } else if (category === 'room') {
      setFilters(prev => ({ ...prev, propertyType: '', roomType: 'Single' }));
    }
  };

  const isCategoryActive = (category) => {
    if (category === 'all') return !filters.propertyType && !filters.roomType;
    if (category === 'landed') return filters.propertyType === 'Terrace';
    if (category === 'apartment') return filters.propertyType === 'Apartment';
    if (category === 'room') return filters.roomType === 'Single';
    return false;
  };

  return (
    <div className="sticky top-16 z-40 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/80 shadow-rs-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left side: Search & Category Chips */}
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            
            {/* Search Pill */}
            <div className="relative w-full sm:w-60">
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

            {/* Horizontal Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: t('filter_all_properties') },
                { id: 'landed', label: t('filter_landed_house') },
                { id: 'apartment', label: t('filter_apartment') },
                { id: 'room', label: t('filter_private_room') }
              ].map(chip => {
                const active = isCategoryActive(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleCategoryClick(chip.id)}
                    className={`rs-pill whitespace-nowrap text-xs font-bold transition-all px-4 py-2 ${
                      active ? 'rs-pill-active' : 'rs-pill-inactive'
                    }`}
                    style={{ height: '36px' }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right side: Price Filter & More Filters */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            
            {/* Price Dropdown */}
            <div className="relative" ref={priceRef}>
              <button
                type="button"
                onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowMoreFilters(false); }}
                className={`rs-pill flex items-center gap-1.5 text-xs font-bold ${
                  filters.minPrice || filters.maxPrice ? 'rs-pill-active' : 'rs-pill-inactive'
                }`}
                style={{ height: '36px' }}
              >
                <span>
                  {filters.minPrice || filters.maxPrice
                    ? `RM${filters.minPrice || 0} - ${filters.maxPrice ? 'RM' + filters.maxPrice : 'Max'}`
                    : t('filter_price')}
                </span>
                <span className="material-symbols-outlined text-xs">expand_more</span>
              </button>

              {showPriceDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111827] border border-gray-150/40 dark:border-gray-800/80 rounded-2xl shadow-rs-lg p-4 z-50 animate-slide-down">
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
                        className="rs-input text-xs h-9 py-0 w-full"
                        style={{ paddingLeft: '28px', height: '36px' }}
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
                        className="rs-input text-xs h-9 py-0 w-full"
                        style={{ paddingLeft: '28px', height: '36px' }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3.5 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                      className="text-[10px] font-bold text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                      {t('filter_clear')}
                    </button>
                    <button
                      onClick={() => setShowPriceDropdown(false)}
                      className="px-3.5 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg hover:bg-primary/95 transition-colors"
                    >
                      {t('filter_apply')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* More Filters Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => { setShowMoreFilters(!showMoreFilters); setShowPriceDropdown(false); }}
                className={`rs-pill flex items-center gap-1.5 text-xs font-bold ${
                  filters.state || filters.furnishedStatus || (filters.roomType && filters.roomType !== 'Single')
                    ? 'rs-pill-active'
                    : 'rs-pill-inactive'
                }`}
                style={{ height: '36px' }}
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span>{t('filter_more_filters')}</span>
                {(filters.state || filters.furnishedStatus || (filters.roomType && filters.roomType !== 'Single')) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>

              {showMoreFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111827] border border-gray-150/40 dark:border-gray-800/80 rounded-2xl shadow-rs-lg p-4 z-50 animate-slide-down space-y-3.5">
                  
                  {/* Location (State) */}
                  {availableStates.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t('filter_location')}</label>
                      <select
                        name="state"
                        value={filters.state}
                        onChange={handleChange}
                        className="rs-select w-full text-xs font-semibold"
                        style={{ height: '36px' }}
                      >
                        <option value="">{t('filter_all_locations')}</option>
                        {availableStates.map(state => (
                          <option key={state} value={state}>{t(state)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Room Type */}
                  {availableRoomTypes.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t('filter_room')}</label>
                      <select
                        name="roomType"
                        value={filters.roomType}
                        onChange={handleChange}
                        className="rs-select w-full text-xs font-semibold"
                        style={{ height: '36px' }}
                      >
                        <option value="">{t('filter_all_types')}</option>
                        {availableRoomTypes.map(type => (
                          <option key={type} value={type}>{t(type)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Furnished Status */}
                  {availableFurnished.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t('pfilter_furnishing')}</label>
                      <select
                        name="furnishedStatus"
                        value={filters.furnishedStatus}
                        onChange={handleChange}
                        className="rs-select w-full text-xs font-semibold"
                        style={{ height: '36px' }}
                      >
                        <option value="">{t('filter_all_types')}</option>
                        {availableFurnished.map(status => (
                          <option key={status} value={status}>{t(status)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800/60">
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, state: '', roomType: '', furnishedStatus: '' }));
                      }}
                      className="text-[10px] font-bold text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                      {t('filter_clear')}
                    </button>
                    <button
                      onClick={() => setShowMoreFilters(false)}
                      className="px-3.5 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg hover:bg-primary/95 transition-colors"
                    >
                      {t('filter_apply')}
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

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