import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById, getHousematesByPropertyId } from '../services/api';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [housemates, setHousemates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceStatus, setDistanceStatus] = useState('calculating...');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propertyData = await getPropertyById(id);
        setProperty(propertyData);

        try {
          const housematesData = await getHousematesByPropertyId(id);
          setHousemates(housematesData || []);
        } catch (err) {
          console.error('Error fetching housemates:', err);
          setHousemates([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!property) return;
    if (!property.latitude || !property.longitude) {
      setDistanceStatus('Location unavailable');
      return;
    }

    if (!navigator.geolocation) {
      setDistanceStatus('Distance unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const dist = calculateDistance(userLat, userLon, property.latitude, property.longitude);
        setDistance(dist.toFixed(1));
        setDistanceStatus('');
      },
      (error) => {
        setDistanceStatus('Distance unavailable');
      }
    );
  }, [property]);

  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading details...</div>;
  if (error || !property) return <div className="text-center py-32 text-error text-lg font-medium">{error || 'Property not found.'}</div>;

  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHByb3BlcnR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=1200&q=80`;
  const mainImage = property.imageUrl || placeholderImage;

  const whatsappNumber = "60123456789";
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in your property: ${property.title} in ${property.city}. Is it still available?`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Google Maps link using property address
  const locationQuery = encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;

  return (
    <div className="pt-24 pb-32">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link to="/properties" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-medium transition-colors">
          <span className="material-symbols-outlined">arrow_back</span> Back to Listings
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[300px] md:h-[500px]">
          <div className="col-span-12 md:col-span-8 md:row-span-2 relative overflow-hidden rounded-lg group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={property.title} src={mainImage} />
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${property.availabilityStatus === 'Available' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {property.availabilityStatus}
              </span>
            </div>
          </div>
          <div className="hidden md:block col-span-4 row-span-1 relative overflow-hidden rounded-lg group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property Detail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlGVz0m4WAKg7KxMswmOnWIiWPhlpLip7ZJMuM_3QlvAhEMSqlZ9iBy59ztLi1mk-6NYQDcT4BEB4ksnvG1ADXdcJBhuMofZOLhehEJv9aFgd8gS_24hV4QOIqbsZMFGb87n3k3JWFflm39INQEfokYoIm_yrCWefZTDI_SjN9B18Kuj62s9NyqISswpDzTp1JJpUFIfUHtcR9W7b6qvA1bo4t6RkUXC7By-aK-ksM3FO4DQehl6ucVibB8J3RbTFQ_LiQ3ixsOUXG" />
          </div>
          <div className="hidden md:block col-span-4 row-span-1 relative overflow-hidden rounded-lg group">
             <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property Bedroom" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABXDjCCUQ9Q-v8VPk2kF9wlCda3RSJ_kWtt82n2tlwGoPaKTqxgR22EZhViwm4c3I9VsbeLVltsVEubkUZrcevNFvg8iPYD2IR9SfGiTg9fonJHH6ORjVamInvsy5qAfQ-UP3HBpxzYFo6eJ-6mGcRQ3AB6IN8-O1JaHk2q6POq8c4H-MaYPmL58uaaAdxjHNLOtRX72Lgoo9rNPRuMCrPVax7vn89BSuwUXAuNpBBMBdVmhkI-oZmtVOtwxNI9_a9cyKJLTOiImOU" />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Property Info */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-medium">{property.propertyType}</span>
              <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-medium">{property.roomType}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">{property.title}</h1>
            <div className="flex items-center text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-lg">{property.address}, {property.city}, {property.state}</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_40px_60px_-10px_rgba(25,28,30,0.04)] flex justify-between items-center">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-1 uppercase tracking-wider">Monthly Rental</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-primary">RM {property.monthlyRent}</span>
                <span className="text-on-surface-variant font-medium">/month</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant text-sm mb-1">Furnishing</p>
              <span className="text-primary font-semibold flex items-center justify-end gap-1">
                 <span className="material-symbols-outlined text-base">chair</span> {property.furnishedStatus}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Property Description</h3>
            <div className="prose prose-slate max-w-none text-on-surface-variant leading-relaxed font-body">
               <p>{property.description || 'No description provided for this listing.'}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Current Housemates</h3>
              <span className="bg-tertiary-container/10 text-tertiary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                 <span className="material-symbols-outlined text-sm">groups</span> {housemates.length} Profile{housemates.length !== 1 && 's'}
              </span>
            </div>
            {housemates.length === 0 ? (
               <p className="text-on-surface-variant">No housemate profiles listed for this property yet.</p>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {housemates.map((hw) => (
                    <div key={hw.id} className="bg-surface-container-lowest p-6 rounded-lg border-2 border-transparent hover:border-primary-fixed transition-all group">
                       <div className="flex flex-col items-center text-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border-4 border-surface-container-high text-primary">
                             <span className="material-symbols-outlined text-4xl">person</span>
                          </div>
                          <div>
                             <h4 className="font-bold text-on-surface">{hw.name}</h4>
                             <p className="text-xs text-primary font-medium">{hw.occupationType}, {hw.age} y/o</p>
                          </div>
                          <div className="flex flex-wrap justify-center gap-1.5">
                             <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">{hw.gender}</span>
                             <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">Clean: {hw.cleanlinessLevel}</span>
                             <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">{hw.sleepSchedule}</span>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            )}
          </div>
          
        </div>

        {/* Right Column: Maps & Actions */}
        <div className="space-y-8">
           <div className="bg-surface-container-low rounded-lg overflow-hidden h-64 relative flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">map</span>
              
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-outline-variant/30 text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">directions_walk</span>
                {distance ? `${distance} km away` : distanceStatus}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-6">
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-on-surface font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined">map</span> View in Maps
                </a>
              </div>
           </div>
        </div>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-t border-outline-variant/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Selected Property</span>
              <span className="text-lg font-bold text-on-surface">{property.title}</span>
           </div>
           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-8 py-3.5 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20">
                 <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>chat_bubble</span> Contact Landlord
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
