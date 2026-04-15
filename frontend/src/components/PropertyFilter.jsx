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
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-on-surface font-headline font-bold text-xl mb-6">Refine Search</h3>
        
        {/* Search */}
        <div className="mb-8">
          <label className="block text-on-surface-variant font-label text-sm font-semibold mb-4">Search By Title/City</label>
          <div className="bg-surface-container-high rounded-lg flex items-center px-4 py-3">
             <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
             <input 
               type="text" 
               name="search"
               placeholder="Search..." 
               value={filters.search}
               onChange={handleChange}
               className="bg-transparent border-none outline-none w-full text-sm font-medium text-on-surface focus:ring-0"
             />
          </div>
        </div>

        {/* State */}
        <div className="mb-8">
          <label className="block text-on-surface-variant font-label text-sm font-semibold mb-4">State</label>
          <select name="state" value={filters.state} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-primary/20 cursor-pointer text-on-surface">
            <option value="">All States</option>
            {availableStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div className="mb-8">
          <label className="block text-on-surface-variant font-label text-sm font-semibold mb-4">Room Type</label>
          <select name="roomType" value={filters.roomType} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-primary/20 cursor-pointer text-on-surface">
            <option value="">All Room Types</option>
            {availableRoomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="mb-8">
          <label className="block text-on-surface-variant font-label text-sm font-semibold mb-4">Property Type</label>
          <select name="propertyType" value={filters.propertyType} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-primary/20 cursor-pointer text-on-surface">
            <option value="">All Properties</option>
            {availablePropertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Furnished Status */}
        <div className="mb-8">
          <label className="block text-on-surface-variant font-label text-sm font-semibold mb-4">Furnishing</label>
          <select name="furnishedStatus" value={filters.furnishedStatus} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-primary/20 cursor-pointer text-on-surface">
            <option value="">All Statuses</option>
            {availableFurnished.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <label className="block text-on-surface-variant font-label text-sm font-semibold mb-4">Price Range (RM)</label>
          <div className="flex gap-4">
             <input 
               type="number" 
               name="minPrice" 
               value={filters.minPrice} 
               onChange={handleChange} 
               className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-primary/20 text-on-surface placeholder-on-surface-variant/50"
               placeholder="Min RM"
             />
             <input 
               type="number" 
               name="maxPrice" 
               value={filters.maxPrice} 
               onChange={handleChange} 
               className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-sm font-medium focus:ring-primary/20 text-on-surface placeholder-on-surface-variant/50"
               placeholder="Max RM"
             />
          </div>
        </div>
      </div>
      
      <button onClick={onReset} className="w-full py-4 bg-surface-container-high rounded-full font-headline font-bold text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-300">
        Clear All Filters
      </button>
    </div>
  );
};

export default PropertyFilter;
