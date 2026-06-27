import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Compute compatibility between logged-in user and a housemate.
 */
const computeMatchScore = (currentUser, housemate) => {
  if (!currentUser) return { score: 0, reasons: [] };
  let score = 0;
  const reasons = [];

  const userSleep = currentUser.sleepSchedule;
  const mateSleep = housemate.sleepSchedule;
  if (userSleep && mateSleep) {
    if (userSleep === mateSleep) { score += 30; reasons.push(`Same sleep pattern: ${mateSleep}`); }
    else if (userSleep === 'Flexible' || mateSleep === 'Flexible') { score += 15; reasons.push('Flexible sleep schedule'); }
  }

  const userBudget = currentUser.budget;
  const mateBudget = housemate.budget;
  if (userBudget && mateBudget) {
    const pctDiff = Math.abs(userBudget - mateBudget) / ((userBudget + mateBudget) / 2);
    if (pctDiff <= 0.1) { score += 30; reasons.push('Very similar budget'); }
    else if (pctDiff <= 0.3) { score += 20; reasons.push('Compatible budget'); }
    else if (pctDiff <= 0.5) { score += 10; reasons.push('Somewhat similar budget'); }
  }

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
  if (score >= 75) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 50) return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' };
  if (score >= 25) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' };
  return { bg: 'bg-gray-400', text: 'text-gray-500', light: 'bg-gray-50', border: 'border-gray-200' };
};

const getScoreLabel = (score) => {
  if (score >= 75) return 'Great Match';
  if (score >= 50) return 'Good Match';
  if (score >= 25) return 'Fair Match';
  return 'Low Match';
};

const AMENITY_ICONS = {
  wifi: { icon: 'wifi', label: 'High-speed WiFi' },
  washing: { icon: 'local_laundry_service', label: 'Washing Machine' },
  ac: { icon: 'ac_unit', label: 'Air Conditioning' },
  fridge: { icon: 'kitchen', label: 'Refrigerator' },
  microwave: { icon: 'microwave', label: 'Microwave' },
  security: { icon: 'security', label: '24/7 Security' },
};

const resolveAmenityIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return 'wifi';
  if (lower.includes('wash') || lower.includes('laundry')) return 'local_laundry_service';
  if (lower.includes('air cond') || lower.includes('ac')) return 'ac_unit';
  if (lower.includes('fridge') || lower.includes('refriger')) return 'kitchen';
  if (lower.includes('microwave') || lower.includes('oven')) return 'microwave';
  if (lower.includes('security') || lower.includes('guard')) return 'security';
  if (lower.includes('pool') || lower.includes('swimming')) return 'pool';
  if (lower.includes('gym') || lower.includes('fit')) return 'fitness_center';
  if (lower.includes('park') || lower.includes('garage')) return 'local_parking';
  if (lower.includes('bath') || lower.includes('toilet')) return 'bathtub';
  if (lower.includes('balcony') || lower.includes('yard')) return 'deck';
  if (lower.includes('cook') || lower.includes('stove') || lower.includes('kitchen')) return 'cooking';
  return 'done_all';
};

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { currentUser, isUitmVerified } = useAuth();
  const { t } = useLanguage();
  const [property, setProperty] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceStatus, setDistanceStatus] = useState('calculating...');
  const [showVerifyWarning, setShowVerifyWarning] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImgIndex, setLightboxImgIndex] = useState(0);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!property) return;
    
    let lat = property.latitude;
    let lon = property.longitude;

    if (!lat || !lon) {
      const cityLower = (property.city || '').toLowerCase().trim();
      const stateLower = (property.state || '').toLowerCase().trim();

      if (cityLower.includes('jasin')) {
        lat = 2.3101;
        lon = 102.4316;
      } else if (cityLower.includes('seri kembangan')) {
        lat = 3.0249;
        lon = 101.7051;
      } else if (cityLower.includes('melaka') || cityLower.includes('malacca') || stateLower.includes('melaka') || stateLower.includes('malacca')) {
        lat = 2.1896;
        lon = 102.2501;
      } else {
        // General fallback coordinate for Jasin campus area if city is unknown
        lat = 2.3101;
        lon = 102.4316;
      }
    }

    const dist = calculateDistance(2.2646, 102.2786, lat, lon);
    setDistance(dist.toFixed(1));
    setDistanceStatus('');
  }, [property]);

  const linkedHousemates = useMemo(() => {
    const propertyId = parseInt(id);
    return allUsers
      .filter(u => u.isListedAsHousemate && u.linkedProperty?.id === propertyId)
      .map(u => {
        const isCurrentUser = currentUser && u.id === currentUser.id;
        const { score, reasons } = isCurrentUser ? { score: 0, reasons: [] } : computeMatchScore(currentUser, u);
        return { ...u, isCurrentUser, matchScore: score, matchReasons: reasons };
      });
  }, [allUsers, id, currentUser]);

  const resolveImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
    return url;
  };

  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80`;
  const allImages = useMemo(() => {
    if (!property) return [];
    if (property.images?.length > 0) return property.images.map(img => resolveImageSrc(img.imageUrl));
    if (property.imageUrl) return [resolveImageSrc(property.imageUrl)];
    return [];
  }, [property]);

  const propertyAmenities = useMemo(() => {
    if (!property || !property.amenities) return [];
    return property.amenities.split(',').map(a => a.trim()).filter(Boolean);
  }, [property]);

  const prevLightboxImg = () => {
    setLightboxImgIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };
  const nextLightboxImg = () => {
    setLightboxImgIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setGalleryIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };
  const nextSlide = (e) => {
    e.stopPropagation();
    setGalleryIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevLightboxImg();
      if (e.key === 'ArrowRight') nextLightboxImg();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxImgIndex, allImages]);

  if (loading) return (
    <div className="rs-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: '3px' }} />
        <p className="text-on-surface-variant font-medium">{t('common_loading')}</p>
      </div>
    </div>
  );

  if (error || !property) return (
    <div className="rs-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-3 block">error_outline</span>
        <p className="text-on-surface font-bold text-lg">{error || 'Property not found.'}</p>
        <Link to="/properties" className="mt-4 inline-block text-primary hover:underline font-medium text-sm">← {t('detail_back')}</Link>
      </div>
    </div>
  );


  const whatsappNumber = '60123456789';
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in your property: ${property.title} in ${property.city}. Is it still available?`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`)}`;

  const isAvailable = property.availabilityStatus === 'Available';
  const scoreColors = getScoreColor(0);

  return (
    <div className="rs-page pb-16">
      <div className="w-full px-6 md:px-10 lg:px-16">

        {/* Back + Share Bar */}
        <div className="py-5 flex items-center justify-between">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to listings
          </Link>
        </div>

        {/* ── Gallery ── */}
        <div className="mb-8 relative group/gallery select-none">
          <div 
            className="relative h-[300px] md:h-[480px] rounded-2xl overflow-hidden cursor-pointer shadow-rs-md bg-black"
            onClick={() => { setLightboxImgIndex(galleryIdx); setIsLightboxOpen(true); }}
          >
            {/* Sliding wrapper */}
            <div 
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${galleryIdx * 100}%)` }}
            >
              {allImages.length > 0 ? (
                allImages.map((img, i) => (
                  <div key={i} className="w-full h-full flex-shrink-0 relative">
                    <img
                      src={img}
                      alt={`${property.title} - Photo ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                ))
              ) : (
                <div className="w-full h-full relative">
                  <img
                    src={placeholderImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-800/80 text-white'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                {property.availabilityStatus}
              </span>
            </div>

            {/* Prev Arrow Control */}
            {allImages.length > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 focus:outline-none z-20"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined text-2xl">chevron_left</span>
              </button>
            )}

            {/* Next Arrow Control */}
            {allImages.length > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/gallery:opacity-100 focus:outline-none z-20"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </button>
            )}

            {/* Dot Indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-full">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setGalleryIdx(i); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      galleryIdx === i 
                        ? 'bg-emerald-400 scale-125' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Photo count / Zoom indicator */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-black/80 transition-colors z-20">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
              <span>{allImages.length || 1} {allImages.length === 1 ? 'photo' : 'photos'}</span>
            </div>
          </div>
        </div>

        {/* ── Lightbox Modal ── */}
        {isLightboxOpen && allImages.length > 0 && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fade-in"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar: Count & Close */}
            <div className="w-full flex items-center justify-between text-white z-50">
              <span className="text-sm font-semibold select-none">
                {lightboxImgIndex + 1} / {allImages.length}
              </span>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Close lightbox"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Main Image Slider View */}
            <div className="flex-1 flex items-center justify-center relative select-none">
              
              {/* Prev Arrow */}
              {allImages.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); prevLightboxImg(); }}
                  className="absolute left-2 md:left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 focus:outline-none"
                  aria-label="Previous photo"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>
              )}

              {/* Image Display */}
              <img 
                src={allImages[lightboxImgIndex]}
                alt={`Property photo ${lightboxImgIndex + 1}`}
                className="max-h-[70vh] md:max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Next Arrow */}
              {allImages.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); nextLightboxImg(); }}
                  className="absolute right-2 md:right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 focus:outline-none"
                  aria-label="Next photo"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Navigation */}
            {allImages.length > 1 && (
              <div className="w-full flex justify-center gap-2 overflow-x-auto no-scrollbar py-2 z-50" onClick={(e) => e.stopPropagation()}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxImgIndex(i)}
                    className={`w-14 h-10 md:w-20 md:h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      lightboxImgIndex === i ? 'border-primary scale-105 opacity-100' : 'border-transparent opacity-40 hover:opacity-75'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Property Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="rs-badge rs-badge-primary">{property.propertyType}</span>
                <span className="rs-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>{property.roomType} Room</span>
                <span className="rs-badge rs-badge-verified">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Listing
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface font-headline mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-primary">location_on</span>
                <span className="font-medium">{property.address}, {property.city}, {property.state}</span>
              </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: 'payments', label: 'Monthly Rent', value: `RM ${property.monthlyRent}`, accent: true },
                { icon: 'chair', label: 'Furnished', value: property.furnishedStatus },
                { icon: 'bed', label: 'Room Type', value: property.roomType },
                { icon: 'directions_walk', label: 'From UiTM', value: distance ? `${distance} km` : distanceStatus },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-rs-sm">
                  <span className={`material-symbols-outlined text-xl mb-1 block ${stat.accent ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {stat.icon}
                  </span>
                  <p className={`font-black text-sm ${stat.accent ? 'text-primary' : 'text-on-surface'}`}>{stat.value}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-rs-sm">
              <h2 className="font-bold text-on-surface text-lg mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">description</span>
                About this property
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {property.description || 'No description provided for this listing. Contact the owner for more details.'}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-rs-sm">
              <h2 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">star</span>
                Amenities
              </h2>
              {propertyAmenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {propertyAmenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                      <span className="material-symbols-outlined text-primary text-base">
                        {resolveAmenityIcon(amenity)}
                      </span>
                      <span className="text-sm font-medium text-on-surface">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">No amenities specified. Please contact the owner to verify available amenities.</p>
              )}
              <p className="text-xs text-on-surface-variant mt-3 italic">Verify with owner for exact amenity availability.</p>
            </div>

            {/* Current Housemates */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-rs-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-on-surface text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">group</span>
                  Current Housemates
                </h2>
                <span className="rs-badge rs-badge-primary">{linkedHousemates.length} profile{linkedHousemates.length !== 1 && 's'}</span>
              </div>

              {linkedHousemates.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">group_off</span>
                  <p className="text-sm text-on-surface-variant font-medium">No housemates linked yet</p>
                  <p className="text-xs text-on-surface-variant mt-1">Students can link their profiles from their profile page.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {linkedHousemates.map((hw) => {
                    const sc = hw.matchScore > 0 ? getScoreColor(hw.matchScore) : null;
                    return (
                      <div key={hw.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-transparent hover:border-primary/20 hover:bg-blue-50/30 transition-all">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
                          {hw.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface text-sm truncate">{hw.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hw.sleepSchedule && (
                              <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-on-surface-variant font-medium">{hw.sleepSchedule}</span>
                            )}
                            {hw.lifestyle && hw.lifestyle.split(',').slice(0, 2).map(l => (
                              <span key={l.trim()} className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary rounded-full font-medium">{l.trim()}</span>
                            ))}
                          </div>
                        </div>
                        {hw.isCurrentUser ? (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">You</span>
                        ) : sc && currentUser && hw.matchScore > 0 ? (
                          <div className={`text-center px-2.5 py-1 rounded-xl ${sc.light} ${sc.border} border flex-shrink-0`}>
                            <span className={`text-sm font-black ${sc.text} block`}>{hw.matchScore}%</span>
                            <span className={`text-[9px] font-bold ${sc.text} opacity-80`}>{getScoreLabel(hw.matchScore)}</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-rs-sm">
              <h2 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">location_on</span>
                Location
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface text-sm">{property.address}</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">{property.city}, {property.state}</p>
                  {distance && (
                    <p className="text-primary text-xs font-bold mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">directions_walk</span>
                      {distance} km from UiTM Jasin
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Right Column (Sticky) ── */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">

              {/* Pricing Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-md p-6">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Starting from</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-black text-primary font-headline">RM {property.monthlyRent}</span>
                  <span className="text-on-surface-variant font-medium">/month</span>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  {currentUser ? (
                    isUitmVerified() ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-all hover:shadow-lg"
                      >
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                        Contact Owner via WhatsApp
                      </a>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setShowVerifyWarning(!showVerifyWarning)}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-base">warning</span>
                          Verify to Contact Owner
                        </button>
                        {showVerifyWarning && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed animate-fade-in">
                            <p className="font-bold mb-1">UiTM verification required</p>
                            Complete your student verification (matric number + UiTM email) in your Profile page.
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-all hover:shadow-rs-blue"
                    >
                      <span className="material-symbols-outlined text-base">lock</span>
                      Sign In to Contact Owner
                    </Link>
                  )}

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-gray-200 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-blue-50/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">location_on</span>
                    View Location
                  </a>
                </div>

                <hr className="border-gray-100 my-4" />

                {/* Property details mini-list */}
                <div className="space-y-2.5 text-sm">
                  {[
                    { icon: 'home_work', label: 'Type', value: property.propertyType },
                    { icon: 'bed', label: 'Room', value: property.roomType },
                    { icon: 'chair', label: 'Furnished', value: property.furnishedStatus },
                    { icon: 'check_circle', label: 'Status', value: property.availabilityStatus },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold text-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-rs-sm">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Admin-Verified Listing</p>
                      <p className="text-[10px] text-on-surface-variant">Reviewed and approved by RakanSewa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Student Community</p>
                      <p className="text-[10px] text-on-surface-variant">Listed for UiTM Jasin students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compatibility Score (logged-in students only) */}
              {currentUser && currentUser.role === 'Student' && linkedHousemates.length > 0 && (() => {
                const bestMatch = linkedHousemates.filter(h => !h.isCurrentUser && h.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore)[0];
                if (!bestMatch) return null;
                const sc = getScoreColor(bestMatch.matchScore);
                return (
                  <div className={`bg-white rounded-2xl border ${sc.border} p-5 shadow-rs-sm`}>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Compatibility Score</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-14 h-14 rounded-full ${sc.bg} flex items-center justify-center shadow-md`}>
                        <span className="text-white text-xl font-black">{bestMatch.matchScore}%</span>
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${sc.text}`}>{getScoreLabel(bestMatch.matchScore)}</p>
                        <p className="text-xs text-on-surface-variant">with current housemate</p>
                      </div>
                    </div>
                    {bestMatch.matchReasons.length > 0 && (
                      <div className="space-y-1.5">
                        {bestMatch.matchReasons.slice(0, 3).map((reason, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span className={`material-symbols-outlined text-xs flex-shrink-0 ${sc.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
