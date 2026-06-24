const PropertyFilter = ({
  filters,
  setFilters,
  availableStates,
  availableRoomTypes,
  availablePropertyTypes,
  availableFurnished,
  onReset
}) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const activeCount = [filters.state, filters.roomType, filters.propertyType, filters.furnishedStatus, filters.minPrice, filters.maxPrice, filters.search]
    .filter(Boolean).length;

  const FilterSection = ({ icon, title, children }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-base text-primary">{icon}</span>
        <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-on-surface text-sm">Filters</h3>
          {activeCount > 0 && (
            <span className="min-w-[20px] h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">

        {/* Search */}
        <FilterSection icon="search" title="Search">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant/60">search</span>
            <input
              type="text"
              name="search"
              placeholder="Title or city..."
              value={filters.search}
              onChange={handleChange}
              className="rs-input pl-9 text-sm"
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </FilterSection>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Price Range */}
        <FilterSection icon="payments" title="Price Range (RM)">
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="Min"
              className="rs-input text-sm w-full"
            />
            <div className="flex items-center text-on-surface-variant flex-shrink-0">
              <span className="text-xs font-medium">–</span>
            </div>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="Max"
              className="rs-input text-sm w-full"
            />
          </div>
        </FilterSection>

        <hr className="border-gray-100" />

        {/* Location */}
        {availableStates.length > 0 && (
          <>
            <FilterSection icon="location_on" title="State / Location">
              <div className="relative">
                <select
                  name="state"
                  value={filters.state}
                  onChange={handleChange}
                  className="rs-select text-sm pr-8"
                  style={{ paddingRight: '32px' }}
                >
                  <option value="">All Locations</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </FilterSection>
            <hr className="border-gray-100" />
          </>
        )}

        {/* Property Type */}
        {availablePropertyTypes.length > 0 && (
          <>
            <FilterSection icon="home_work" title="Property Type">
              <div className="relative">
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleChange}
                  className="rs-select text-sm pr-8"
                  style={{ paddingRight: '32px' }}
                >
                  <option value="">All Types</option>
                  {availablePropertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </FilterSection>
            <hr className="border-gray-100" />
          </>
        )}

        {/* Room Type */}
        {availableRoomTypes.length > 0 && (
          <>
            <FilterSection icon="bed" title="Room Type">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, roomType: '' }))}
                  className={`rs-pill text-xs ${!filters.roomType ? 'rs-pill-active' : 'rs-pill-inactive'}`}
                >
                  All
                </button>
                {availableRoomTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilters(prev => ({ ...prev, roomType: prev.roomType === type ? '' : type }))}
                    className={`rs-pill text-xs ${filters.roomType === type ? 'rs-pill-active' : 'rs-pill-inactive'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FilterSection>
            <hr className="border-gray-100" />
          </>
        )}

        {/* Furnished Status */}
        {availableFurnished.length > 0 && (
          <FilterSection icon="chair" title="Furnishing">
            <div className="space-y-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, furnishedStatus: '' }))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !filters.furnishedStatus
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {availableFurnished.map(status => (
                <button
                  key={status}
                  onClick={() => setFilters(prev => ({ ...prev, furnishedStatus: prev.furnishedStatus === status ? '' : status }))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.furnishedStatus === status
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

      </div>

      {/* Footer Reset */}
      {activeCount > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyFilter;
