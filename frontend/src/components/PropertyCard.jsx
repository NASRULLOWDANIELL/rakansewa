import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHByb3BlcnR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60`;

  return (
    <article className="group relative bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_40px_60px_-10px_rgba(25,28,30,0.04)] hover:shadow-[0_40px_80px_-5px_rgba(0,88,190,0.08)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col">
      <div className="h-64 overflow-hidden relative">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={property.title} src={placeholderImage}/>
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-tertiary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
          <span className="text-xs font-bold text-on-surface">4.8</span>
        </div>
        <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-lg rounded-full text-white cursor-pointer hover:bg-white/40 transition-colors">
          <span className="material-symbols-outlined text-sm">favorite</span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface leading-tight line-clamp-1" title={property.title}>{property.title}</h3>
            <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-base">location_on</span> {property.city}, {property.state}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="block text-xl font-headline font-extrabold text-primary">RM {property.monthlyRent}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Per Month</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-2 min-h-[3rem]">
           {property.description || `Beautiful ${property.propertyType} ready for viewing. Contact us today.`}
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-8 auto-rows-max">
           <span className="flex items-center gap-1.5 text-xs font-medium bg-secondary-container/50 px-3 py-1.5 rounded-full text-on-secondary-container">
               <span className="material-symbols-outlined text-sm">bed</span> {property.roomType}
           </span>
           <span className="flex items-center gap-1.5 text-xs font-medium bg-secondary-container/50 px-3 py-1.5 rounded-full text-on-secondary-container">
               <span className="material-symbols-outlined text-sm">chair</span> {property.furnishedStatus}
           </span>
           <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${property.availabilityStatus === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
               <span className="material-symbols-outlined text-sm">{property.availabilityStatus === 'Available' ? 'check_circle' : 'cancel'}</span> {property.availabilityStatus}
           </span>
        </div>
        <div className="mt-auto">
          <Link to={`/properties/${property.id}`} className="w-full py-4 block text-center bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-headline font-bold tracking-tight shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform">
             View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
