import { useEffect, useState, useMemo } from 'react';
import { getAllUsers, getMatchesForUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];

const PRIORITY_ICONS = {
  'Budget':         'payments',
  'Sleep Pattern':  'bedtime',
  'Cleanliness':    'cleaning_services',
  'Quietness':      'volume_off',
  'Social Style':   'groups',
  'Study Habit':    'school',
  'Activity Level': 'fitness_center',
  'Flexibility':    'tune',
};

/**
 * Priority name → which lifestyle tag (or special handler) to compare.
 */
const TAG_FOR_PRIORITY = {
  'Cleanliness':    'Clean',
  'Quietness':      'Quiet',
  'Social Style':   'Social',
  'Study Habit':    'Studious',
  'Activity Level': 'Active',
  'Flexibility':    'Flexible',
};

/**
 * Client-side fallback scoring — respects the viewer's priority order.
 * Used for guests or when the backend matching endpoint is unavailable.
 */
const computeScore = (currentUser, housemate) => {
  if (!currentUser) return { score: 0, reasons: [] };

  const myTags    = (currentUser.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
  const theirTags = (housemate.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);

  // Resolve viewer's priorities (fall back to defaults)
  const p1 = currentUser.priority1 || DEFAULT_PRIORITIES[0];
  const p2 = currentUser.priority2 || DEFAULT_PRIORITIES[1];
  const p3 = currentUser.priority3 || DEFAULT_PRIORITIES[2];
  const priorities = [p1, p2, p3];
  const weights    = [40, 30, 20];

  const all8 = ['Budget', 'Sleep Pattern', 'Cleanliness', 'Quietness',
                 'Social Style', 'Study Habit', 'Activity Level', 'Flexibility'];
  const remaining = all8.filter(c => !priorities.includes(c)); // 5 items

  let score = 0;
  const reasons = [];
  const addReason = (r) => { if (!reasons.includes(r)) reasons.push(r); };

  const rawScore = (criterion) => {
    if (criterion === 'Budget') {
      const b1 = currentUser.budget, b2 = housemate.budget;
      if (!b1 || !b2 || b1 <= 0 || b2 <= 0) return 0;
      const pct = Math.abs(b1 - b2) / ((b1 + b2) / 2);
      if (pct <= 0.10) { addReason('Very similar budget range');   return 1.0; }
      if (pct <= 0.30) { addReason('Compatible budget range');     return 0.67; }
      if (pct <= 0.50) { addReason('Somewhat similar budget');     return 0.33; }
      return 0;
    }
    if (criterion === 'Sleep Pattern') {
      const s1 = currentUser.sleepSchedule, s2 = housemate.sleepSchedule;
      if (!s1 || !s2) return 0;
      if (s1 === s2) { addReason(`Same sleep pattern: ${s2}`); return 1.0; }
      if (s1 === 'Flexible' || s2 === 'Flexible') { addReason('Flexible sleep schedule'); return 0.5; }
      return 0;
    }
    const tag = TAG_FOR_PRIORITY[criterion];
    if (tag) {
      const has = myTags.some(t => t.toLowerCase() === tag.toLowerCase());
      const theirHas = theirTags.some(t => t.toLowerCase() === tag.toLowerCase());
      if (has && theirHas) { addReason(`Shared lifestyle: ${tag}`); return 1.0; }
    }
    return 0;
  };

  // Priority slots
  priorities.forEach((p, i) => { score += rawScore(p) * weights[i]; });
  // Remaining: each worth 2 pts
  remaining.forEach(p => { score += rawScore(p) * 2; });

  // Prepend priority note
  if (reasons.length > 0) {
    reasons.unshift(`Priority match: ${p1} \u2192 ${p2} \u2192 ${p3}`);
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

const HousematesPage = () => {
  const { currentUser, isUitmVerified } = useAuth();
  const [housemates, setHousemates] = useState([]);
  const [backendMatches, setBackendMatches] = useState(null); // null = not loaded, [] = loaded but empty
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHousemates = async () => {
      try {
        const users = await getAllUsers();
        // Only show users who opted in as housemates
        const listed = (users || []).filter(u => 
          u.isListedAsHousemate === true && 
          u.id !== currentUser?.id
        );
        setHousemates(listed);

        // Try to get backend-computed matching scores if user is logged in
        if (currentUser?.id && currentUser.id !== 999) {
          try {
            const matches = await getMatchesForUser(currentUser.id);
            setBackendMatches(matches || []);
          } catch (matchErr) {
            console.warn('Backend matching not available, using client-side scoring:', matchErr);
            setBackendMatches(null);
          }
        }
      } catch (err) {
        console.error('Error fetching housemates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHousemates();
  }, [currentUser]);

  // Build a map of userId -> backend match result
  const backendMatchMap = useMemo(() => {
    if (!backendMatches) return {};
    const map = {};
    backendMatches.forEach(m => {
      if (m.userId) {
        map[m.userId] = m;
      }
    });
    return map;
  }, [backendMatches]);

  // Compute scores and sort by best match first
  const scoredHousemates = useMemo(() => {
    return housemates.map(hm => {
      const linkedProperty = hm.linkedProperty || null;
      
      // Use backend matching scores if available, otherwise fall back to client-side
      const backendMatch = backendMatchMap[hm.id];
      let matchScore, matchReasons, matchLabel;
      
      if (backendMatch) {
        matchScore   = Math.round(backendMatch.compatibilityScore);
        matchReasons = backendMatch.matchedReasons || [];
        matchLabel   = backendMatch.compatibilityLabel;
      } else {
        const { score, reasons } = computeScore(currentUser, hm);
        matchScore   = score;
        matchReasons = reasons;
        matchLabel   = getScoreLabel(score);
      }

      return { ...hm, matchScore, matchReasons, matchLabel, linkedProperty };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [housemates, currentUser, backendMatchMap]);

  const filteredHousemates = scoredHousemates.filter(hm => {
    if (filter === 'all') return true;
    // Support multi-select lifestyles (comma-separated)
    const lifestyles = (hm.lifestyle || '').split(',').map(s => s.trim());
    return lifestyles.some(l => l.toLowerCase() === filter.toLowerCase());
  });

  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading housemates...</div>;

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Find Your Compatible Housemate</h1>
        <p className="text-on-surface-variant text-lg">Browse compatible students and view where they are staying.</p>
      </div>

      {/* ── Priority Banner ── */}
      {currentUser && currentUser.id !== 999 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-2xl border border-primary/20 flex flex-wrap items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings:"'FILL' 1"}}>bar_chart</span>
          <span className="text-sm font-bold text-on-surface">Your Matching Priorities:</span>
          {[currentUser.priority1 || DEFAULT_PRIORITIES[0],
            currentUser.priority2 || DEFAULT_PRIORITIES[1],
            currentUser.priority3 || DEFAULT_PRIORITIES[2]
          ].map((p, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && <span className="text-on-surface-variant text-sm">→</span>}
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/70 border border-primary/20 text-primary text-xs font-bold rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[13px]">{PRIORITY_ICONS[p] || 'star'}</span>
                {p}
              </span>
            </span>
          ))}
          {!currentUser.priority1 && (
            <span className="text-xs text-on-surface-variant italic ml-1">(defaults)</span>
          )}
          <Link
            to="/profile/housemate"
            className="ml-auto text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Change priorities
          </Link>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'Clean', 'Quiet', 'Social', 'Studious', 'Active', 'Flexible'].map(opt => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              filter === opt 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {opt === 'all' ? 'All' : opt}
          </button>
        ))}
      </div>

      {filteredHousemates.length === 0 ? (
        <div className="text-center py-20 glass rounded-xl border border-white/40">
          <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">groups</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No Housemates Found</h3>
          <p className="text-on-surface-variant">No users have listed themselves as housemates yet{filter !== 'all' ? ` with "${filter}" lifestyle` : ''}.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-end border-b border-surface-container-low pb-4">
            <h2 className="text-2xl font-bold font-headline text-on-surface">Available Housemates</h2>
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">{filteredHousemates.length} Found</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHousemates.map((hm) => (
              <div key={hm.id} className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_40px_60px_-10px_rgba(25,28,30,0.04)] hover:shadow-[0_50px_80px_-15px_rgba(0,88,190,0.08)] transition-all duration-500 hover:-translate-y-1 border border-white/40">
                
                {/* Header with avatar + score badge */}
                <div className="relative bg-gradient-to-br from-primary/10 to-tertiary/10 p-8 pb-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary-fixed flex items-center justify-center text-3xl text-on-primary-fixed font-bold shadow-lg uppercase">
                    {hm.name?.charAt(0) || '?'}
                  </div>

                  {/* Matching score badge */}
                  {currentUser && hm.matchScore > 0 && (
                    <div className="absolute top-4 right-4">
                      <div className={`bg-gradient-to-br ${getScoreColor(hm.matchScore)} text-white rounded-2xl px-4 py-2 shadow-xl flex flex-col items-center min-w-[68px]`}>
                        <span className="text-2xl font-black leading-none tracking-tight">{hm.matchScore}%</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-90">Match</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0 -mt-4 relative z-10 flex flex-col flex-grow">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-headline font-bold text-on-surface">{hm.name}</h3>
                    {currentUser && hm.matchScore > 0 && (
                      <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                        hm.matchScore >= 75 ? 'bg-green-100 text-green-700' :
                        hm.matchScore >= 50 ? 'bg-blue-100 text-blue-700' :
                        hm.matchScore >= 25 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {hm.matchLabel || getScoreLabel(hm.matchScore)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {hm.lifestyle && hm.lifestyle.split(',').map(l => l.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">emoji_people</span>
                        {tag}
                      </span>
                    ))}
                    {hm.sleepSchedule && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">bedtime</span>
                        {hm.sleepSchedule}
                      </span>
                    )}
                  </div>

                  {hm.budget && (
                    <div className="bg-surface-container-low rounded-xl p-3 text-center mb-4">
                      <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Budget</span>
                      <span className="text-xl font-extrabold text-primary">RM {hm.budget}</span>
                      <span className="text-on-surface-variant text-xs">/month</span>
                    </div>
                  )}

                  {/* Linked Property */}
                  <div className="bg-surface-container-low rounded-xl p-3 mb-4">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold block mb-1">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-1">home</span>
                      Linked Rental Property
                    </span>
                    {hm.linkedProperty ? (
                      <Link 
                        to={`/properties/${hm.linkedProperty.id}`} 
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        {hm.linkedProperty.title}
                        {hm.linkedProperty.city && (
                          <span className="text-on-surface-variant font-normal ml-1">
                            — {hm.linkedProperty.city}, {hm.linkedProperty.state}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="text-sm text-on-surface-variant italic">No linked property yet</span>
                    )}
                  </div>

                  {/* Match reasons */}
                  {currentUser && hm.matchReasons && hm.matchReasons.length > 0 && (
                    <div className="mb-4 space-y-1 border-t border-surface-container-low pt-3">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1.5">Priority-Based Match</p>
                      {hm.matchReasons.slice(0, 4).map((reason, idx) => (
                        <span key={idx} className={`flex items-center gap-2 text-xs ${
                          idx === 0 ? 'text-on-surface-variant font-medium italic' : 'text-primary'
                        }`}>
                          {idx === 0
                            ? <span className="material-symbols-outlined text-[12px]">info</span>
                            : <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          }
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  {currentUser ? (
                    isUitmVerified() ? (
                      <button className="mt-auto w-full py-3 bg-surface-container-high hover:bg-primary hover:text-white text-on-surface rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">chat</span>
                        Contact Housemate
                      </button>
                    ) : (
                      <button
                        className="mt-auto w-full py-3 bg-surface-container-low text-on-surface-variant rounded-full font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-not-allowed opacity-70"
                        title="Complete UiTM verification to contact housemates"
                        disabled
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-amber-500">warning</span>
                          Complete UiTM Verification to Contact
                        </span>
                      </button>
                    )
                  ) : (
                    <Link to="/login" className="mt-auto w-full py-3 bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/30 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Login to Contact
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HousematesPage;
