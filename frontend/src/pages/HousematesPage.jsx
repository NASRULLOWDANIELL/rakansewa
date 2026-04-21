import { useEffect, useState, useMemo } from 'react';
import { getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Compute a simple compatibility score between the current user and a housemate.
 * Criteria: lifestyle overlap, sleep schedule match, budget proximity.
 */
const computeScore = (currentUser, housemate) => {
  if (!currentUser) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];

  // --- Lifestyle overlap (multi-select: comma-separated string) ---
  const myLifestyles = (currentUser.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
  const theirLifestyles = (housemate.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
  if (myLifestyles.length > 0 && theirLifestyles.length > 0) {
    const overlap = myLifestyles.filter(l => theirLifestyles.includes(l));
    if (overlap.length > 0) {
      score += Math.min(40, (overlap.length / Math.max(myLifestyles.length, 1)) * 40);
      reasons.push(`Shared lifestyle: ${overlap.join(', ')}`);
    }
  }

  // --- Sleep schedule ---
  if (currentUser.sleepSchedule && housemate.sleepSchedule) {
    if (currentUser.sleepSchedule === housemate.sleepSchedule) {
      score += 30;
      reasons.push(`Same sleep pattern: ${housemate.sleepSchedule}`);
    } else if (currentUser.sleepSchedule === 'Flexible' || housemate.sleepSchedule === 'Flexible') {
      score += 15;
      reasons.push('Flexible sleep schedule');
    }
  }

  // --- Budget proximity ---
  if (currentUser.budget && housemate.budget) {
    const diff = Math.abs(currentUser.budget - housemate.budget);
    const avg = (currentUser.budget + housemate.budget) / 2;
    const pctDiff = diff / avg;
    if (pctDiff <= 0.1) {
      score += 30;
      reasons.push('Very similar budget range');
    } else if (pctDiff <= 0.3) {
      score += 20;
      reasons.push('Compatible budget range');
    } else if (pctDiff <= 0.5) {
      score += 10;
      reasons.push('Somewhat similar budget');
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

const HousematesPage = () => {
  const { currentUser } = useAuth();
  const [housemates, setHousemates] = useState([]);
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
      } catch (err) {
        console.error('Error fetching housemates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHousemates();
  }, [currentUser]);

  // Compute scores and sort by best match first
  const scoredHousemates = useMemo(() => {
    return housemates.map(hm => {
      const { score, reasons } = computeScore(currentUser, hm);
      return { ...hm, matchScore: score, matchReasons: reasons };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [housemates, currentUser]);

  const filteredHousemates = scoredHousemates.filter(hm => {
    if (filter === 'all') return true;
    // Support multi-select lifestyles (comma-separated)
    const lifestyles = (hm.lifestyle || '').split(',').map(s => s.trim());
    return lifestyles.some(l => l.toLowerCase() === filter.toLowerCase());
  });

  if (loading) return <div className="text-center py-32 text-on-surface text-lg font-medium">Loading housemates...</div>;

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Find Housemates</h1>
        <p className="text-on-surface-variant text-lg">Browse users who are looking for housemates. Update your own profile to appear here.</p>
      </div>

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
                  {currentUser?.isListedAsHousemate && hm.matchScore > 0 && (
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
                    <p className="text-sm text-on-surface-variant">{hm.email}</p>
                    {currentUser?.isListedAsHousemate && hm.matchScore > 0 && (
                      <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                        hm.matchScore >= 75 ? 'bg-green-100 text-green-700' :
                        hm.matchScore >= 50 ? 'bg-blue-100 text-blue-700' :
                        hm.matchScore >= 25 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getScoreLabel(hm.matchScore)}
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

                  {/* Match reasons */}
                  {currentUser?.isListedAsHousemate && hm.matchReasons && hm.matchReasons.length > 0 && (
                    <div className="mb-4 space-y-1 border-t border-surface-container-low pt-3">
                      {hm.matchReasons.slice(0, 3).map((reason, idx) => (
                        <span key={idx} className="flex items-center gap-2 text-xs text-primary">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  <button className="mt-auto w-full py-3 bg-surface-container-high hover:bg-primary hover:text-white text-on-surface rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Contact
                  </button>
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
