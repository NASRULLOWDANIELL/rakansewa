import { useEffect, useState, useMemo } from 'react';
import { getAllUsers, getMatchesForUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];

const PRIORITY_ICONS = {
  'Budget': 'payments',
  'Sleep Pattern': 'bedtime',
  'Cleanliness': 'cleaning_services',
  'Quietness': 'volume_off',
  'Social Style': 'groups',
  'Study Habit': 'school',
  'Activity Level': 'fitness_center',
  'Flexibility': 'tune',
};

const TAG_FOR_PRIORITY = {
  'Cleanliness': 'Clean',
  'Quietness': 'Quiet',
  'Social Style': 'Social',
  'Study Habit': 'Studious',
  'Activity Level': 'Active',
  'Flexibility': 'Flexible',
};

const computeScore = (currentUser, housemate) => {
  if (!currentUser) return { score: 0, reasons: [] };

  const myTags = (currentUser.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
  const theirTags = (housemate.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);

  const p1 = currentUser.priority1 || DEFAULT_PRIORITIES[0];
  const p2 = currentUser.priority2 || DEFAULT_PRIORITIES[1];
  const p3 = currentUser.priority3 || DEFAULT_PRIORITIES[2];
  const priorities = [p1, p2, p3];
  const weights = [40, 30, 20];

  const all8 = ['Budget', 'Sleep Pattern', 'Cleanliness', 'Quietness', 'Social Style', 'Study Habit', 'Activity Level', 'Flexibility'];
  const remaining = all8.filter(c => !priorities.includes(c));

  let score = 0;
  const reasons = [];
  const addReason = (r) => { if (!reasons.includes(r)) reasons.push(r); };

  const rawScore = (criterion) => {
    if (criterion === 'Budget') {
      const b1 = currentUser.budget, b2 = housemate.budget;
      if (!b1 || !b2 || b1 <= 0 || b2 <= 0) return 0;
      const pct = Math.abs(b1 - b2) / ((b1 + b2) / 2);
      if (pct <= 0.10) { addReason('Similar budget range'); return 1.0; }
      if (pct <= 0.30) { addReason('Compatible budget'); return 0.67; }
      if (pct <= 0.50) { addReason('Somewhat similar budget'); return 0.33; }
      return 0;
    }
    if (criterion === 'Sleep Pattern') {
      const s1 = currentUser.sleepSchedule, s2 = housemate.sleepSchedule;
      if (!s1 || !s2) return 0;
      if (s1 === s2) { addReason(`Same sleep schedule: ${s2}`); return 1.0; }
      if (s1 === 'Flexible' || s2 === 'Flexible') { addReason('Flexible sleep schedule'); return 0.5; }
      return 0;
    }
    const tag = TAG_FOR_PRIORITY[criterion];
    if (tag) {
      const has = myTags.some(t => t.toLowerCase() === tag.toLowerCase());
      const theirHas = theirTags.some(t => t.toLowerCase() === tag.toLowerCase());
      if (has && theirHas) { addReason(`Shared value: ${tag}`); return 1.0; }
    }
    return 0;
  };

  priorities.forEach((p, i) => { score += rawScore(p) * weights[i]; });
  remaining.forEach(p => { score += rawScore(p) * 2; });

  return { score: Math.min(100, Math.round(score)), reasons };
};

const getScoreConfig = (score) => {
  if (score >= 75) return { gradient: 'from-emerald-500 to-green-600', textColor: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Great Match', labelBg: 'bg-emerald-100 text-emerald-700' };
  if (score >= 50) return { gradient: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200', label: 'Good Match', labelBg: 'bg-blue-100 text-blue-700' };
  if (score >= 25) return { gradient: 'from-amber-500 to-orange-500', textColor: 'text-amber-600', lightBg: 'bg-amber-50', border: 'border-amber-200', label: 'Fair Match', labelBg: 'bg-amber-100 text-amber-700' };
  return { gradient: 'from-gray-400 to-gray-500', textColor: 'text-gray-500', lightBg: 'bg-gray-50', border: 'border-gray-200', label: 'Low Match', labelBg: 'bg-gray-100 text-gray-600' };
};

/* ── Lifestyle filter config ── */
const FILTER_OPTIONS = [
  { value: 'all', label: 'All', icon: 'group' },
  { value: 'Clean', label: 'Clean', icon: 'cleaning_services' },
  { value: 'Quiet', label: 'Quiet', icon: 'volume_off' },
  { value: 'Social', label: 'Social', icon: 'groups' },
  { value: 'Studious', label: 'Studious', icon: 'school' },
  { value: 'Active', label: 'Active', icon: 'fitness_center' },
  { value: 'Flexible', label: 'Flexible', icon: 'tune' },
];

/* ── Match Card ── */
const MatchCard = ({ hm, currentUser, isUitmVerified }) => {
  const sc = getScoreConfig(hm.matchScore || 0);
  const lifestyles = (hm.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm hover:shadow-rs-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">

      {/* Header gradient */}
      <div className={`relative bg-gradient-to-br ${sc.gradient} p-6 pb-10`}>
        {/* Match score badge */}
        {currentUser && hm.matchScore > 0 && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/30">
            <span className="text-white text-2xl font-black leading-none block">{hm.matchScore}%</span>
            <span className="text-white/80 text-[9px] font-bold uppercase tracking-wider">Match</span>
          </div>
        )}

        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black border border-white/30 shadow-lg">
          {hm.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>

      {/* Content — overlapping the header */}
      <div className="px-5 -mt-5 relative z-10 flex flex-col flex-1">
        <div className="bg-white rounded-xl border border-gray-100 shadow-rs-sm px-4 py-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-on-surface text-base font-headline">{hm.name}</h3>
              {currentUser && hm.matchScore > 0 && (
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${sc.labelBg}`}>
                  {hm.matchLabel || sc.label}
                </span>
              )}
            </div>
            {hm.budget && (
              <div className="text-right flex-shrink-0">
                <span className="block text-sm font-black text-primary">RM {hm.budget}</span>
                <span className="text-[10px] text-on-surface-variant font-medium">{t('common_per_month')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lifestyle Tags */}
        {lifestyles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {lifestyles.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary text-[11px] font-bold rounded-full" style={{ background: 'rgba(0,88,190,0.06)' }}>
                <span className="material-symbols-outlined text-[10px]">emoji_people</span>
                {tag}
              </span>
            ))}
            {hm.sleepSchedule && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-on-surface-variant text-[11px] font-bold rounded-full">
                <span className="material-symbols-outlined text-[10px]">bedtime</span>
                {hm.sleepSchedule}
              </span>
            )}
          </div>
        )}

        {/* Linked Property */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">home</span>
            {t('hm_linked_property')}
          </p>
          {hm.linkedProperty ? (
            <Link
              to={`/properties/${hm.linkedProperty.id}`}
              className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline group/link"
            >
              <span className="material-symbols-outlined text-xs group-hover/link:scale-110 transition-transform">open_in_new</span>
              <span className="line-clamp-1">{hm.linkedProperty.title}</span>
              {hm.linkedProperty.city && (
                <span className="text-on-surface-variant font-normal flex-shrink-0">• {hm.linkedProperty.city}</span>
              )}
            </Link>
          ) : (
            <span className="text-xs text-on-surface-variant italic">{t('hm_no_property')}</span>
          )}
        </div>

        {/* ── Why You Match Section ── */}
        {currentUser && hm.matchReasons && hm.matchReasons.length > 0 && (
          <div className={`mb-4 p-3 rounded-xl border ${sc.border} ${sc.lightBg}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${sc.textColor}`}>
              Why you match
            </p>
            <div className="space-y-1.5">
              {hm.matchReasons.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                  <span className={`material-symbols-outlined text-xs flex-shrink-0 mt-0.5 ${sc.textColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Progress Bar */}
        {currentUser && hm.matchScore > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Compatibility</span>
              <span className={`text-[10px] font-black ${sc.textColor}`}>{hm.matchScore}%</span>
            </div>
            <div className="rs-progress">
              <div
                className={`rs-progress-fill bg-gradient-to-r ${sc.gradient}`}
                style={{ width: `${hm.matchScore}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-auto pb-5">
          {currentUser ? (
            isUitmVerified() ? (
              <button className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all hover:shadow-rs-blue flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">chat</span>
                Contact Housemate
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-amber-50 text-amber-700 text-sm font-bold rounded-xl border border-amber-200 flex items-center justify-center gap-2 cursor-not-allowed"
                title="Complete UiTM verification to contact housemates"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                Verify to Contact
              </button>
            )
          ) : (
            <Link
              to="/login"
              className="w-full py-2.5 border border-gray-200 text-on-surface-variant text-sm font-bold rounded-xl hover:border-primary/40 hover:text-primary hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              {t('hm_login_to_match')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const HousematesPage = () => {
  const { currentUser, isUitmVerified } = useAuth();
  const { t } = useLanguage();
  const [housemates, setHousemates] = useState([]);
  const [backendMatches, setBackendMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHousemates = async () => {
      try {
        const users = await getAllUsers();
        const listed = (users || []).filter(u => u.isListedAsHousemate === true && u.id !== currentUser?.id);
        setHousemates(listed);

        if (currentUser?.id && currentUser.id !== 999) {
          try {
            const matches = await getMatchesForUser(currentUser.id);
            setBackendMatches(matches || []);
          } catch {
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

  const backendMatchMap = useMemo(() => {
    if (!backendMatches) return {};
    const map = {};
    backendMatches.forEach(m => { if (m.userId) map[m.userId] = m; });
    return map;
  }, [backendMatches]);

  const scoredHousemates = useMemo(() => {
    return housemates.map(hm => {
      const backendMatch = backendMatchMap[hm.id];
      let matchScore, matchReasons, matchLabel;

      if (backendMatch) {
        matchScore = Math.round(backendMatch.compatibilityScore);
        matchReasons = backendMatch.matchedReasons || [];
        matchLabel = backendMatch.compatibilityLabel;
      } else {
        const { score, reasons } = computeScore(currentUser, hm);
        matchScore = score;
        matchReasons = reasons;
        matchLabel = getScoreConfig(score).label;
      }

      return { ...hm, matchScore, matchReasons, matchLabel, linkedProperty: hm.linkedProperty || null };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [housemates, currentUser, backendMatchMap]);

  const filteredHousemates = scoredHousemates.filter(hm => {
    if (filter === 'all') return true;
    const lifestyles = (hm.lifestyle || '').split(',').map(s => s.trim());
    return lifestyles.some(l => l.toLowerCase() === filter.toLowerCase());
  });

  const priorities = [
    currentUser?.priority1 || DEFAULT_PRIORITIES[0],
    currentUser?.priority2 || DEFAULT_PRIORITIES[1],
    currentUser?.priority3 || DEFAULT_PRIORITIES[2],
  ];

  const greatMatches = filteredHousemates.filter(h => h.matchScore >= 75).length;
  const goodMatches = filteredHousemates.filter(h => h.matchScore >= 50).length;

  return (
    <div className="rs-page pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-on-surface font-headline mb-1">
                {t('hm_title')}
              </h1>
              <p className="text-on-surface-variant text-sm">
                {currentUser ? t('hm_subtitle') : t('hm_subtitle')}
              </p>
            </div>
            {currentUser && (
              <Link
                to="/profile/housemate"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-on-surface hover:border-primary/40 hover:text-primary hover:bg-blue-50/30 transition-all shadow-rs-sm flex-shrink-0"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                Edit Preferences
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats Strip (logged-in users) ── */}
        {currentUser && currentUser.id !== 999 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-rs-sm text-center">
              <span className="text-3xl font-black text-on-surface">{filteredHousemates.length}</span>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">{t('hm_stats_total')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-rs-sm text-center" style={{ background: '#f0fdf4' }}>
              <span className="text-3xl font-black text-emerald-600">{greatMatches}</span>
              <p className="text-xs text-emerald-600/70 font-medium mt-0.5">{t('hm_stats_great')} (75%+)</p>
            </div>
            <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-rs-sm text-center" style={{ background: '#eff6ff' }}>
              <span className="text-3xl font-black text-blue-600">{goodMatches}</span>
              <p className="text-xs text-blue-600/70 font-medium mt-0.5">{t('hm_stats_good')} (50%+)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-rs-sm text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {priorities.slice(0, 3).map((p, i) => (
                  <span key={i} className="material-symbols-outlined text-primary text-sm" title={p}>{PRIORITY_ICONS[p] || 'star'}</span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Your Priorities</p>
            </div>
          </div>
        )}

        {/* ── Priority Banner ── */}
        {currentUser && currentUser.id !== 999 && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-rs-sm flex-wrap">
            <span className="material-symbols-outlined text-primary text-base">bar_chart</span>
            <span className="text-sm font-bold text-on-surface">Matching priorities:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {priorities.map((p, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-gray-300 text-sm">→</span>}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 border border-primary/15 text-primary text-xs font-bold rounded-full" style={{ background: 'rgba(0,88,190,0.06)' }}>
                    <span className="material-symbols-outlined text-[11px]">{PRIORITY_ICONS[p] || 'star'}</span>
                    {p}
                  </span>
                </span>
              ))}
            </div>
            {!currentUser.priority1 && (
              <span className="text-xs text-on-surface-variant italic">(default priorities)</span>
            )}
            <Link
              to="/profile/housemate"
              className="ml-auto text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              Change
            </Link>
          </div>
        )}

        {/* ── Filter Pills ── */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rs-pill text-xs ${filter === opt.value ? 'rs-pill-active' : 'rs-pill-inactive'}`}
            >
              <span className="material-symbols-outlined text-[12px]">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="skeleton h-28 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-16 rounded-full" />
                    <div className="skeleton h-6 w-14 rounded-full" />
                  </div>
                  <div className="skeleton h-16 w-full rounded-xl" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHousemates.length === 0 ? (
          /* Empty State */
          <div className="rs-empty-state">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">group_off</span>
            </div>
            <h3 className="font-bold text-on-surface text-lg mb-1">No housemates found</h3>
            <p className="text-on-surface-variant text-sm max-w-xs mb-5">
              {filter !== 'all'
                ? `No housemates with "${filter}" lifestyle. Try a different filter.`
                : 'No students have listed themselves as housemates yet.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="rs-btn-primary text-sm py-2.5 px-6"
              >
                Show All
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-on-surface-variant font-medium">
                Showing <span className="font-bold text-on-surface">{filteredHousemates.length}</span> {filteredHousemates.length === 1 ? 'student' : 'students'}
                {filter !== 'all' ? ` · ${filter}` : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHousemates.map(hm => (
                <MatchCard
                  key={hm.id}
                  hm={hm}
                  currentUser={currentUser}
                  isUitmVerified={isUitmVerified}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HousematesPage;
