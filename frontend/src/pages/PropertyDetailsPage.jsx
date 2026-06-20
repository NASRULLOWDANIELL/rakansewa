import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Compute compatibility between logged-in user and a housemate (user).
 */
const computeMatchScore = (currentUser, housemate) => {
  if (!currentUser) return { score: 0, reasons: [] };
  let score = 0;
  const reasons = [];

  // Sleep schedule
  const userSleep = currentUser.sleepSchedule;
  const mateSleep = housemate.sleepSchedule;
  if (userSleep && mateSleep) {
    if (userSleep === mateSleep) {
      score += 30;
      reasons.push(`Same sleep pattern: ${mateSleep}`);
    } else if (userSleep === 'Flexible' || mateSleep === 'Flexible') {
      score += 15;
      reasons.push('Flexible sleep schedule');
    }
  }

  // Budget proximity
  const userBudget = currentUser.budget;
  const mateBudget = housemate.budget;
  if (userBudget && mateBudget) {
    const diff = Math.abs(userBudget - mateBudget);
    const avg = (userBudget + mateBudget) / 2;
    const pctDiff = avg > 0 ? diff / avg : 1;
    if (pctDiff <= 0.1) {
      score += 30;
      reasons.push('Very similar budget');
    } else if (pctDiff <= 0.3) {
      score += 20;
      reasons.push('Compatible budget');
    } else if (pctDiff <= 0.5) {
      score += 10;
      reasons.push('Somewhat similar budget');
    }
  }

  // Lifestyle overlap
  const myLifestyles = (currentUser.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
  const theirLifestyles = (housemate.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
  if (myLifestyles.length > 0 && theirLifestyles.length > 0) {
    const overlap = myLifestyles.filter(l => theirLifestyles.includes(l));
    if (overlap.length > 0) {
      score += Math.min(30, (overlap.length / Math.max(myLifestyles.length, 1)) * 30);
      reasons.push(`Shared lifestyle: ${overlap.join(', ')}`);
    }
  }

  return { score: Math.min(100, Math.round(score)), reasons };
};

const getScoreColor = (score) => {
  if (score >= 75) return 'from-green-500 to-emerald-600';
  if (score >= 50) return 'from-blue-500 to-indigo-600';
  if (score >= 25) return 'from-amber-500 to-orange-600';
  return 'from-gray-400 to-gray-500';
};

const getScoreLabel = (score) => {
  if (score >= 75) return 'Great Match';
  if (score >= 50) return 'Good Match';
  if (score >= 25) return 'Fair Match';
  return 'Low Match';
};

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { currentUser, isUitmVerified } = useAuth();
  const [property, setProperty] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceStatus, setDistanceStatus] = useState('calculating...');
  const [showVerifyWarning, setShowVerifyWarning] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertyData, usersData] = await Promise.all([
          getPropertyById(id),
          getAllUsers().catch(() => [])
        ]);
        setProperty(propertyData);
        setAllUsers(usersData || []);
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

    const uitmJasinLat = 2.2646;
    const uitmJasinLon = 102.2786;
    const dist = calculateDistance(uitmJasinLat, uitmJasinLon, property.latitude, property.longitude);
    setDistance(dist.toFixed(1));
    setDistanceStatus('');
  }, [property]);

  // Find users linked to this property (via linkedProperty.id)
  const linkedHousemates = useMemo(() => {
    const propertyId = parseInt(id);
    return allUsers
      .filter(u => 
        u.isListedAsHousemate === true && 
        u.linkedProperty && 
        u.linkedProperty.id === propertyId
      )
      .map(u => {
        const isCurrentUser = currentUser && u.id === currentUser.id;
        const { score, reasons } = isCurrentUser
          ? { score: 0, reasons: [] }
          : computeMatchScore(currentUser, u);
        return {
          ...u,
          isCurrentUser,
          matchScore: score,
          matchReasons: reasons,
        };
      });
  }, [allUsers, id, currentUser]);

  // Resolve image src: if it starts with /uploads, prepend backend URL
  const resolveImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
    return url;
  };

  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading details...</div>;
  if (error || !property) return <div className="text-center py-32 text-error text-lg font-medium">{error || 'Property not found.'}</div>;

  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHByb3BlcnR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=1200&q=80`;

  // Build ordered image list: from images[] first, then fall back to imageUrl
  const allImages = (() => {
    if (property.images && property.images.length > 0) {
      return property.images.map(img => resolveImageSrc(img.imageUrl));
    }
    if (property.imageUrl) return [resolveImageSrc(property.imageUrl)];
    return [];
  })();

  const mainImage = allImages[0] || placeholderImage;
  const sideImage1 = allImages[1] || null;
  const sideImage2 = allImages[2] || null;

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
          {/* Main large image */}
          <div className="col-span-12 md:col-span-8 md:row-span-2 relative overflow-hidden rounded-lg group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={property.title} src={mainImage} />
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${property.availabilityStatus === 'Available' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {property.availabilityStatus}
              </span>
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">photo_library</span>
                {allImages.length} Photos
              </div>
            )}
          </div>
          {/* Side image 1 */}
          <div className="hidden md:block col-span-4 row-span-1 relative overflow-hidden rounded-lg group">
            {sideImage1 ? (
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property photo 2" src={sideImage1} />
            ) : (
              <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">photo</span>
              </div>
            )}
          </div>
          {/* Side image 2 */}
          <div className="hidden md:block col-span-4 row-span-1 relative overflow-hidden rounded-lg group">
            {sideImage2 ? (
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property photo 3" src={sideImage2} />
            ) : (
              <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">photo</span>
              </div>
            )}
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

          {/* Current Housemates Section — from users table */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Current Housemates at This Property</h3>
              <span className="bg-tertiary-container/10 text-tertiary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">groups</span> {linkedHousemates.length} Profile{linkedHousemates.length !== 1 && 's'}
              </span>
            </div>
            {linkedHousemates.length === 0 ? (
              <div className="text-center py-8 bg-surface-container-low rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">group_off</span>
                <p className="text-on-surface-variant font-medium">No housemates linked to this property yet.</p>
                <p className="text-xs text-on-surface-variant/70 mt-1">Students can link their profiles to this property from their profile page.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {linkedHousemates.map((hw) => (
                  <div key={hw.id} className="bg-surface-container-lowest p-6 rounded-lg border-2 border-transparent hover:border-primary-fixed transition-all group">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border-4 border-surface-container-high text-primary">
                        <span className="material-symbols-outlined text-4xl">person</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface">{hw.name}</h4>
                      </div>

                      {/* Match score */}
                      {hw.isCurrentUser ? (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">Your Profile</span>
                      ) : hw.matchScore > 0 && currentUser ? (
                        <div className="space-y-1">
                          <div className={`bg-gradient-to-br ${getScoreColor(hw.matchScore)} text-white rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2`}>
                            <span className="text-lg font-black">{hw.matchScore}%</span>
                            <span className="text-[10px] font-bold uppercase">{getScoreLabel(hw.matchScore)}</span>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap justify-center gap-1.5">
                        {hw.budget && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">RM {hw.budget}</span>
                        )}
                        {hw.sleepSchedule && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">{hw.sleepSchedule}</span>
                        )}
                        {/* Show lifestyle tags */}
                        {hw.lifestyle && hw.lifestyle.split(',').map(l => l.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{tag}</span>
                        ))}
                      </div>

                      {/* Match reasons */}
                      {!hw.isCurrentUser && hw.matchReasons && hw.matchReasons.length > 0 && (
                        <div className="space-y-0.5 w-full text-left">
                          {hw.matchReasons.slice(0, 3).map((reason, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-[10px] text-primary">
                              <span className="material-symbols-outlined text-[10px]">check_circle</span> {reason}
                            </span>
                          ))}
                        </div>
                      )}
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
              {distance ? `${distance} km from UiTM Jasin` : distanceStatus}
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
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto relative">
            {currentUser ? (
              isUitmVerified() ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-8 py-3.5 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span> Contact Landlord
                </a>
              ) : (
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => setShowVerifyWarning(!showVerifyWarning)}
                    className="w-full px-8 py-3.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/5 cursor-not-allowed opacity-75"
                  >
                    <span className="material-symbols-outlined text-amber-500">warning</span> Complete UiTM Verification to Contact
                  </button>
                  {showVerifyWarning && (
                    <div className="absolute bottom-full mb-2 right-0 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs shadow-lg w-72 animate-[fadeIn_0.2s_ease-out]">
                      <span className="font-bold block mb-1">UiTM verification required</span>
                      Please complete your UiTM student verification (matric number + UiTM email) in your Profile page to contact landlords.
                    </div>
                  )}
                </div>
              )
            ) : (
              <Link to="/login" className="flex-1 md:flex-none px-8 py-3.5 rounded-full bg-surface-container-high text-on-surface font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/5">
                <span className="material-symbols-outlined">lock</span> Login to Contact
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
