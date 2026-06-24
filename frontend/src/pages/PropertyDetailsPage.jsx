import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [activeImg, setActiveImg] = useState(0);

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
    if (!property.latitude || !property.longitude) { setDistanceStatus('Location unavailable'); return; }
    const dist = calculateDistance(2.2646, 102.2786, property.latitude, property.longitude);
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

  if (loading) return (
    <div className="rs-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: '3px' }} />
        <p className="text-on-surface-variant font-medium">Loading property details...</p>
      </div>
    </div>
  );

  if (error || !property) return (
    <div className="rs-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-3 block">error_outline</span>
        <p className="text-on-surface font-bold text-lg">{error || 'Property not found.'}</p>
        <Link to="/properties" className="mt-4 inline-block text-primary hover:underline font-medium text-sm">← Back to listings</Link>
      </div>
    </div>
  );

  const placeholderImage = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80`;
  const allImages = (() => {
    if (property.images?.length > 0) return property.images.map(img => resolveImageSrc(img.imageUrl));
    if (property.imageUrl) return [resolveImageSrc(property.imageUrl)];
    return [];
  })();

  const mainImage = allImages[activeImg] || placeholderImage;
  const whatsappNumber = '60123456789';
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in your property: ${property.title} in ${property.city}. Is it still available?`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`)}`;

  const isAvailable = property.availabilityStatus === 'Available';
  const scoreColors = getScoreColor(0);

  return (
    <div className="rs-page pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Back + Share Bar */}
        <div className="py-5 flex items-center justify-between">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to listings
          </Link>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">map</span>
            View in Maps
          </a>
        </div>

        {/* ── Gallery ── */}
        <div className="mb-8">
          <div className="grid grid-cols-12 gap-3 h-[260px] md:h-[420px] rounded-2xl overflow-hidden">
            {/* Main large image */}
            <div className="col-span-12 md:col-span-8 relative group cursor-pointer overflow-hidden">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

              {/* Status badge */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-gray-800/80 text-white'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                  {property.availabilityStatus}
                </span>
              </div>

              {/* Photo count */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">photo_library</span>
                  {allImages.length} photos
                </div>
              )}
            </div>

            {/* Side images */}
            <div className="hidden md:flex md:col-span-4 flex-col gap-3">
              {[allImages[1], allImages[2]].map((img, i) => (
                <div
                  key={i}
                  className="flex-1 relative overflow-hidden group cursor-pointer rounded-lg"
                  onClick={() => img && setActiveImg(i + 1)}
                >
                  {img ? (
                    <img src={img} alt={`Property photo ${i + 2}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-gray-300">photo</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail strip (if > 3 images) */}
          {allImages.length > 3 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary shadow-rs-blue scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(AMENITY_ICONS).map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                    <span className="material-symbols-outlined text-primary text-base">{icon}</span>
                    <span className="text-sm font-medium text-on-surface">{label}</span>
                  </div>
                ))}
              </div>
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
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all hover:shadow-rs-blue flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Maps
                </a>
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
