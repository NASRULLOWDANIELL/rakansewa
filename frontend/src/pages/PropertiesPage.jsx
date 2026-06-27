import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
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

/* ── Unified search and filter pill bar ── */
const FilterPillBar = ({
  filters,
  setFilters,
  availableStates,
  availableRoomTypes,
  availablePropertyTypes,
  availableFurnished,
  onReset,
  activeFilterCount,
  t,
  showFavouritesToggle,
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
    <div className="space-y-4 mb-10">
      
      {/* 1. Full-width Search Bar (pill-shaped) */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant/60 pointer-events-none">search</span>
        <input
          type="text"
          name="search"
          placeholder={t('pfilter_search_placeholder')}
          value={filters.search}
          onChange={handleChange}
          className="w-full pl-12 pr-4 text-sm font-semibold rounded-2xl border border-gray-150/40 dark:border-gray-800/80 bg-white dark:bg-[#111827]/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-rs-sm"
          style={{ height: '48px' }}
        />
      </div>

      {/* 2. Filter Pill container */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-[#111827]/40 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 p-4 shadow-rs-sm">
        
        <div className="flex items-center gap-2 text-on-surface-variant flex-shrink-0">
          <span className="material-symbols-outlined text-lg text-primary">filter_alt</span>
          <span className="text-sm font-black">{t('filter_title')}:</span>
        </div>

          {/* Left side: Category Chips */}
          <div className="flex-grow flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
                  className={`rs-pill whitespace-nowrap text-sm font-extrabold transition-all px-5 py-2.5 ${
                    active ? 'rs-pill-active' : 'rs-pill-inactive'
                  }`}
                  style={{ height: '42px' }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Vertical Divider (md screen only) */}
          <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-800" />

          {/* Right side: Favourites, Price & More Filters */}
          <div className="flex items-center gap-2.5 flex-shrink-0">

            {/* Favourites Toggle */}
            {showFavouritesToggle && (
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, onlyFavourites: !prev.onlyFavourites }))}
                className={`rs-pill flex items-center gap-1.5 text-sm font-extrabold transition-all ${
                  filters.onlyFavourites
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30'
                    : 'rs-pill-inactive'
                }`}
                style={{ height: '42px' }}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={filters.onlyFavourites ? { fontVariationSettings: "'FILL' 1", color: '#e11d48' } : {}}
                >
                  favorite
                </span>
                <span className={filters.onlyFavourites ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>
                  {t('prop_filter_favourites')}
                </span>
              </button>
            )}
            
            {/* Price Dropdown */}
            <div className="relative" ref={priceRef}>
              <button
                type="button"
                onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowMoreFilters(false); }}
                className={`rs-pill flex items-center gap-1.5 text-sm font-extrabold ${
                  filters.minPrice || filters.maxPrice ? 'rs-pill-active' : 'rs-pill-inactive'
                }`}
                style={{ height: '42px' }}
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
                className={`rs-pill flex items-center gap-1.5 text-sm font-extrabold ${
                  filters.state || filters.furnishedStatus || (filters.roomType && filters.roomType !== 'Single')
                    ? 'rs-pill-active'
                    : 'rs-pill-inactive'
                }`}
                style={{ height: '42px' }}
              >
                <span className="material-symbols-outlined text-base">filter_list</span>
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
  );
};

/* ── Recommended properties carousel based on student budget ── */
const RecommendedCarousel = ({ properties, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = 2;

  // Group properties into slides of up to 2 items
  const slides = useMemo(() => {
    const res = [];
    for (let i = 0; i < properties.length; i += itemsPerSlide) {
      res.push(properties.slice(i, i + itemsPerSlide));
    }
    return res;
  }, [properties]);

  const maxIndex = slides.length - 1;

  if (properties.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="mb-10 relative group/carousel">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-4xl font-black tracking-tight text-on-surface font-headline flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          {t('prop_recommended_budget')}
        </h2>
        <p className="text-base text-on-surface-variant font-medium">
          {t('prop_recommended_budget_sub')}
        </p>
      </div>
      
      {/* Carousel Outer Wrapper */}
      <div className="relative px-1">
        
        {/* Left Control */}
        {maxIndex > 0 && currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-lg z-20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
        )}

        {/* Right Control */}
        {maxIndex > 0 && currentIndex < maxIndex && (
          <button
            onClick={handleNext}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-lg z-20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        )}

        {/* Slider Window */}
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slideItems, slideIdx) => (
              <div key={slideIdx} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 px-0.5 py-0.5">
                {slideItems.map(property => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="relative h-68 md:h-80 rounded-2xl overflow-hidden shadow-rs-sm hover:shadow-rs-md group flex flex-col"
                  >
                    {/* Background Image */}
                    <img
                      src={property.imageUrl && property.imageUrl.startsWith('/uploads') ? `http://localhost:8080${property.imageUrl}` : (property.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70')}
                      alt={property.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 flex flex-col justify-end p-5 z-10">
                      <div>
                        <span className="text-[9px] font-black text-white bg-primary px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-2">
                          {t('prop_recommended_badge')}
                        </span>
                        <h4 className="font-extrabold text-white text-base md:text-lg line-clamp-1 leading-snug">{property.title}</h4>
                        <p className="text-xs text-white/80 mt-0.5">{property.city}, {property.state}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                        <span className="text-base font-black text-white">
                          RM {property.monthlyRent}
                          <span className="text-xs font-normal opacity-80">/mo</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-green-400 bg-green-950/40 px-2.5 py-0.5 rounded border border-green-800/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          {t('card_available')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
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
    maxPrice: '',
    onlyFavourites: false
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
      if (filters.onlyFavourites && !favouritedIds.has(property.id)) return false;
      return true;
    });
  }, [allProperties, filters, favouritedIds]);

  const budgetRecommended = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];
    const targetBudget = currentUser?.budget || 500;
    const available = allProperties.filter(p => p.approvalStatus === 'Approved' && p.availabilityStatus === 'Available');
    return available
      .map(p => ({ ...p, diff: Math.abs(p.monthlyRent - targetBudget) }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 6);
  }, [allProperties, currentUser?.budget]);


  const availableStates = [...new Set(allProperties.map(p => p.state).filter(Boolean))];
  const availableRoomTypes = [...new Set(allProperties.map(p => p.roomType).filter(Boolean))];
  const availablePropertyTypes = [...new Set(allProperties.map(p => p.propertyType).filter(Boolean))];
  const availableFurnished = [...new Set(allProperties.map(p => p.furnishedStatus).filter(Boolean))];

  const activeFilterCount = [filters.state, filters.roomType, filters.propertyType, filters.furnishedStatus, filters.minPrice, filters.maxPrice, filters.search, filters.onlyFavourites].filter(Boolean).length;

  return (
    <div className="rs-page pb-20">

      <div className="w-full px-6 md:px-10 lg:px-16 py-8">

        {/* Recommended Properties Carousel */}
        {!loading && budgetRecommended.length > 0 && (
          <RecommendedCarousel properties={budgetRecommended} t={t} />
        )}

        {/* Unified Filter Pill Bar */}
        <FilterPillBar
          filters={filters}
          setFilters={setFilters}
          availableStates={availableStates}
          availableRoomTypes={availableRoomTypes}
          availablePropertyTypes={availablePropertyTypes}
          availableFurnished={availableFurnished}
          onReset={() => setFilters(initialFilters)}
          activeFilterCount={activeFilterCount}
          t={t}
          showFavouritesToggle={!!currentUser}
        />

        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface font-headline mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
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