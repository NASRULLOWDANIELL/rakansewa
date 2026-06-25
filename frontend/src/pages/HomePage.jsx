import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getProperties, getAllUsers } from '../services/api';

/* ── Feature cards data ── */
const FEATURES = [
  {
    icon: 'verified',
    iconBg: 'bg-blue-50',
    iconColor: 'text-primary',
    titleKey: 'feat_title_listings',
    descKey: 'feat_desc_listings',
  },
  {
    icon: 'map',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    titleKey: 'feat_title_distance',
    descKey: 'feat_desc_distance',
  },
  {
    icon: 'diversity_3',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    titleKey: 'feat_title_matching',
    descKey: 'feat_desc_matching',
  },
  {
    icon: 'shield_person',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    titleKey: 'feat_title_trust',
    descKey: 'feat_desc_trust',
  },
];

/* ── How It Works steps ── */
const HOW_IT_WORKS = [
  { step: '01', icon: 'person_add', titleKey: 'hiw_step1_title', descKey: 'hiw_step1_desc' },
  { step: '02', icon: 'tune', titleKey: 'hiw_step2_title', descKey: 'hiw_step2_desc' },
  { step: '03', icon: 'chat_bubble', titleKey: 'hiw_step3_title', descKey: 'hiw_step3_desc' },
];

/* ── Student CTA Card ── */
const StudentCtaCard = ({ currentUser, t }) => {
  const isListed = currentUser?.isListedAsHousemate;
  return (
    <div className="relative bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-10 md:p-14 text-white overflow-hidden shadow-rs-lg">
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <span className="material-symbols-outlined text-4xl text-white/90" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isListed ? 'groups' : 'person_add'}
          </span>
        </div>
        <div className="text-center md:text-left flex-grow space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">
            {isListed ? t('cta_student_listed_title') : t('cta_student_unlisted_title')}
          </h2>
          <p className="text-lg opacity-85 max-w-xl leading-relaxed">
            {isListed
              ? t('cta_student_listed_desc')
              : t('cta_student_unlisted_desc')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <Link
              to={isListed ? '/housemates' : '/profile/housemate'}
              className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">{isListed ? 'search' : 'edit'}</span>
              {isListed ? t('hero_cta_housemates') : t('cta_edit_profile')}
            </Link>
            {isListed && (
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-white/25 transition-all duration-300 hover:scale-[1.03]"
              >
                <span className="material-symbols-outlined text-base">home</span>
                {t('hero_cta_listings')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Guest CTA Card ── */
const GuestCtaCard = ({ currentUser, t }) => (
  <div className="relative bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden shadow-rs-lg">
    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-4xl font-extrabold font-headline tracking-tight">{t('cta_guest_title')}</h2>
      <p className="text-xl opacity-85 leading-relaxed">{t('cta_guest_sub')}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <Link
          to="/properties"
          className="bg-white text-primary px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2 justify-center"
        >
          <span className="material-symbols-outlined text-base">apartment</span>
          {t('cta_browse')}
        </Link>
        {!currentUser && (
          <Link
            to="/register"
            className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/15 hover:border-white/80 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            {t('cta_create_acc')}
          </Link>
        )}
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
const HomePage = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const isStudent = currentUser?.role === 'Student' || currentUser?.role === 'STUDENT';

  /* ── Live stats ── */
  const [stats, setStats] = useState({ listings: 0, seekers: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [properties, users] = await Promise.all([
          getProperties().catch(() => []),
          getAllUsers().catch(() => []),
        ]);
        const activeListings = (properties || []).filter(
          p => p.approvalStatus === 'Approved'
        ).length;

        // Compute compatibility score between two users
        const computeScore = (u1, u2) => {
          if (!u1 || !u2) return 0;
          const DEFAULT_PRIORITIES = ['Budget', 'Sleep Pattern', 'Cleanliness'];
          const TAG_FOR_PRIORITY = {
            'Cleanliness': 'Clean',
            'Quietness': 'Quiet',
            'Social Style': 'Social',
            'Study Habit': 'Studious',
            'Activity Level': 'Active',
            'Flexibility': 'Flexible',
          };
          const myTags = (u1.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
          const theirTags = (u2.lifestyle || '').split(',').map(s => s.trim()).filter(Boolean);
          const p1 = u1.priority1 || DEFAULT_PRIORITIES[0];
          const p2 = u1.priority2 || DEFAULT_PRIORITIES[1];
          const p3 = u1.priority3 || DEFAULT_PRIORITIES[2];
          const priorities = [p1, p2, p3];
          const weights = [40, 30, 20];
          const all8 = ['Budget', 'Sleep Pattern', 'Cleanliness', 'Quietness', 'Social Style', 'Study Habit', 'Activity Level', 'Flexibility'];
          const remaining = all8.filter(c => !priorities.includes(c));

          let score = 0;
          const rawScore = (criterion) => {
            if (criterion === 'Budget') {
              const b1 = u1.budget, b2 = u2.budget;
              if (!b1 || !b2 || b1 <= 0 || b2 <= 0) return 0;
              const pct = Math.abs(b1 - b2) / ((b1 + b2) / 2);
              if (pct <= 0.10) return 1.0;
              if (pct <= 0.30) return 0.67;
              if (pct <= 0.50) return 0.33;
              return 0;
            }
            if (criterion === 'Sleep Pattern') {
              const s1 = u1.sleepSchedule, s2 = u2.sleepSchedule;
              if (!s1 || !s2) return 0;
              if (s1 === s2) return 1.0;
              if (s1 === 'Flexible' || s2 === 'Flexible') return 0.5;
              return 0;
            }
            const tag = TAG_FOR_PRIORITY[criterion];
            if (tag) {
              const has = myTags.some(t => t.toLowerCase() === tag.toLowerCase());
              const theirHas = theirTags.some(t => t.toLowerCase() === tag.toLowerCase());
              if (has && theirHas) return 1.0;
            }
            return 0;
          };

          priorities.forEach((p, i) => { score += rawScore(p) * weights[i]; });
          remaining.forEach(p => { score += rawScore(p) * 2; });
          return Math.min(100, Math.round(score));
        };

        const listedHousemates = (users || []).filter(u => u.isListedAsHousemate === true);
        let activeSeekers = 0;
        for (let i = 0; i < listedHousemates.length; i++) {
          const userA = listedHousemates[i];
          let hasMatch = false;
          for (let j = 0; j < listedHousemates.length; j++) {
            if (i === j) continue;
            if (computeScore(userA, listedHousemates[j]) >= 50) {
              hasMatch = true;
              break;
            }
          }
          if (hasMatch) {
            activeSeekers++;
          }
        }

        setStats({ listings: activeListings, seekers: activeSeekers });
      } catch {
        setStats({ listings: 0, seekers: 0 });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  /* ── Format stat number ── */
  const fmtStat = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : n > 0 ? `${n}+` : '0';

  return (
    <div className="homepage-gradient-bg min-h-screen relative overflow-hidden">

      {/* Light Mode ambient glow blobs (hidden in dark mode) */}
      <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-200/35 to-indigo-200/35 blur-[120px] pointer-events-none dark:hidden" />
      <div className="absolute top-[30%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-orange-100/45 to-rose-100/40 blur-[110px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-[20%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-100/35 to-fuchsia-100/35 blur-[110px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-[2%] right-[2%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-sky-100/45 to-teal-50/40 blur-[100px] pointer-events-none dark:hidden" />

      {/* ─────────────────────────────
          HERO — Matching-first focus
          ───────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 via-white/10 to-transparent pointer-events-none" />
        <div className="absolute top-8 right-[8%] w-80 h-80 bg-primary/4 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-[4%] w-60 h-60 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">

            {/* Platform badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-primary/20 px-4 py-2 rounded-full text-xs font-bold text-primary shadow-rs-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t('hero_badge')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-headline leading-[1.1] tracking-tight text-on-surface mb-6">
              {t('hero_headline_start')}{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #0058be 0%, #3b82f6 100%)' }}
              >
                {t('hero_headline_accent')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
              {t('hero_sub')}
            </p>

            {/* Primary action buttons — matching-first */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                to="/housemates"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary text-white px-8 py-4 rounded-full font-bold text-sm shadow-rs-blue hover:bg-primary/90 hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                {t('hero_cta_housemates')}
              </Link>
              <Link
                to="/properties"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-on-surface px-8 py-4 rounded-full font-bold text-sm border border-gray-200 hover:border-primary/30 hover:bg-blue-50/40 hover:text-primary transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-rs-sm"
              >
                <span className="material-symbols-outlined text-base">apartment</span>
                {t('hero_cta_listings')}
              </Link>
              {!currentUser && (
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-primary px-8 py-4 rounded-full font-bold text-sm border-2 border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  {t('hero_cta_register')}
                </Link>
              )}
            </div>

            {/* Trust line */}
            <p className="text-xs text-on-surface-variant flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              {t('hero_trust')}
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────
          STATS ROW
          ───────────────────────────── */}
      <section className="py-10 px-6 max-w-4xl mx-auto">
        <div className="bg-white/85 dark:bg-[#111827]/85 backdrop-blur-md rounded-3xl border border-gray-150/40 dark:border-gray-800/80 p-6 md:p-8 shadow-rs-md">
          <div className="grid grid-cols-3 gap-6 md:gap-12 text-center divide-x divide-gray-100 dark:divide-gray-800">
            {[
              { value: fmtStat(stats.listings), label: t('stat_listings'), icon: 'home_work', loading: statsLoading },
              { value: fmtStat(stats.seekers), label: t('stat_matched'), icon: 'groups', loading: statsLoading },
              { value: '100%', label: t('stat_verified'), icon: 'verified_user', loading: false },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-2">
                <span className="material-symbols-outlined text-primary text-lg mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                {stat.loading ? (
                  <div className="skeleton h-8 w-16 rounded mb-0.5" />
                ) : (
                  <span className="text-2xl md:text-3xl font-black text-on-surface font-headline">{stat.value}</span>
                )}
                <span className="text-xs text-on-surface-variant font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────
          HOW IT WORKS
          ───────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{t('hiw_label')}</p>
          <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface">{t('hiw_title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl border border-gray-100 p-7 shadow-rs-sm hover:shadow-rs-md transition-all duration-300 group"
            >
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3 w-6 h-0.5 bg-gray-200 z-10" />
              )}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 group-hover:bg-primary group-hover:shadow-rs-blue rounded-xl flex items-center justify-center transition-all duration-300">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-xl transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">{step.step}</span>
                  <h3 className="font-bold text-on-surface text-base mb-1.5 font-headline">{t(step.titleKey)}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{t(step.descKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────
          FEATURES GRID
          ───────────────────────────── */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{t('feat_label')}</p>
            <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-3">{t('feat_title')}</h2>
            <p className="text-on-surface-variant text-base max-w-xl mx-auto">{t('feat_sub')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group bg-white/60 dark:bg-[#111827]/60 backdrop-blur-sm hover:bg-white dark:hover:bg-[#111827] border border-gray-150/40 dark:border-gray-800/80 p-7 rounded-2xl transition-all duration-300 hover:shadow-rs-md text-center cursor-default"
              >
                <div className={`w-14 h-14 mx-auto ${f.iconBg} group-hover:scale-110 transition-transform duration-300 rounded-2xl flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined text-2xl ${f.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h4 className="text-base font-bold font-headline text-on-surface mb-2">{t(f.titleKey)}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────
          CTA SECTION — Personalized
          ───────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {isStudent ? (
            <StudentCtaCard currentUser={currentUser} t={t} />
          ) : (
            <GuestCtaCard currentUser={currentUser} t={t} />
          )}
        </div>
      </section>

      {/* ─────────────────────────────
          FOOTER STRIP
          ───────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
            </div>
            <span className="font-bold text-on-surface font-headline">Rakan<span className="text-primary">Sewa</span></span>
          </div>
          <p className="text-xs text-on-surface-variant text-center">
            A student housing &amp; housemate matching platform for UiTM Jasin. &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-xs hover:text-primary transition-colors font-medium">About</Link>
            <Link to="/properties" className="text-xs hover:text-primary transition-colors font-medium">Listings</Link>
            <Link to="/housemates" className="text-xs hover:text-primary transition-colors font-medium">Matches</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
