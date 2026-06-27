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
  const { t, lang } = useLanguage();
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

  /* â”€â”€ Format stat number â”€â”€ */
  const fmtStat = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : n > 0 ? `${n}+` : '0';

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">

      {/* Light Mode ambient glow blobs (hidden in dark mode) */}
      <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-200/30 to-indigo-200/35 blur-[120px] pointer-events-none dark:hidden" />
      <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-200/25 to-blue-200/30 blur-[110px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-[20%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-100/30 to-fuchsia-100/30 blur-[110px] pointer-events-none dark:hidden" />

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          HERO â€” Unified 2-Column SaaS Layout
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        
        <div className="relative max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          
          {/* Outer Box Card with Gradient Background */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#ebf3ff]/90 via-white/85 to-[#e1ecff]/85 dark:from-[#111827]/90 dark:to-[#0f172a]/95 rounded-[32px] border border-blue-100/60 dark:border-slate-800 p-10 md:p-14 lg:p-20 xl:py-24 xl:px-28 shadow-rs-md">
            
            {/* Ambient glow inside the card top-right */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
              
              {/* Left side: Brand copy, CTAs */}
              <div className="lg:col-span-7 space-y-8 text-left">
                {/* Platform badge */}
                <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-[#111827]/80 backdrop-blur-sm border border-primary/20 px-5 py-2.5 rounded-full text-sm font-bold text-primary shadow-rs-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {t('hero_badge_unified')}
                </div>

                {/* Headline with custom colored words */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black font-headline leading-[1.12] tracking-tight text-on-surface">
                  {lang === 'en' ? (
                    <>
                      Find your perfect <span className="text-primary">home</span> and <span className="text-primary">roomies</span>.
                    </>
                  ) : (
                    <>
                      Cari <span className="text-primary">rumah</span> dan <span className="text-primary">rakan serumah</span> ideal anda.
                    </>
                  )}
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
                  {t('hero_sub_unified')}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Link
                    to="/properties"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-base shadow-rs-blue hover:bg-primary/95 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">search</span>
                    {t('hero_cta_listings')}
                  </Link>
                  <Link
                    to="/housemates"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#1e293b] text-on-surface dark:text-white px-8 py-4 rounded-full font-bold text-base border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-rs-sm"
                  >
                    <span className="material-symbols-outlined text-lg">groups</span>
                    {t('hero_cta_housemates')}
                  </Link>
                </div>
              </div>

              {/* Right side: Staggered stacked stats cards */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full relative">
                <div className="flex flex-col gap-6 items-center lg:items-end w-full max-w-[360px]">
                  
                  {/* Card 1: Active Listings */}
                  <div className="bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-150/40 dark:border-slate-800/80 p-6 shadow-rs-md flex items-center gap-5 w-full transition-all duration-300 hover:scale-[1.02] transform hover:-translate-y-1 lg:-translate-x-14 md:-translate-x-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-primary">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
                    </div>
                    <div>
                      {statsLoading ? (
                        <div className="skeleton h-8 w-16 rounded mb-1" />
                      ) : (
                        <h4 className="text-3xl font-black text-on-surface font-headline leading-none mb-1">
                          {fmtStat(stats.listings)}
                        </h4>
                      )}
                      <p className="text-xs sm:text-sm text-on-surface-variant font-semibold">
                        {t('stat_listings')}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Students Matched */}
                  <div className="bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-150/40 dark:border-slate-800/80 p-6 shadow-rs-md flex items-center gap-5 w-full transition-all duration-300 hover:scale-[1.02] transform hover:-translate-y-1 lg:translate-x-6 md:translate-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                    <div>
                      {statsLoading ? (
                        <div className="skeleton h-8 w-16 rounded mb-1" />
                      ) : (
                        <h4 className="text-3xl font-black text-on-surface font-headline leading-none mb-1">
                          {fmtStat(stats.seekers)}
                        </h4>
                      )}
                      <p className="text-xs sm:text-sm text-on-surface-variant font-semibold">
                        {t('stat_matched')}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: 100% Verified */}
                  <div className="relative bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-150/40 dark:border-slate-800/80 p-6 shadow-rs-md flex items-center gap-5 w-full transition-all duration-300 hover:scale-[1.02] transform hover:-translate-y-1 lg:-translate-x-10 md:-translate-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-primary">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-on-surface font-headline leading-none mb-1">
                        100%
                      </h4>
                      <p className="text-xs sm:text-sm text-on-surface-variant font-semibold">
                        {t('stat_verified')}
                      </p>
                    </div>

                    {/* Join Now! tag */}
                    <div className="absolute -top-3.5 -right-3 bg-primary text-white font-headline text-[11px] font-black px-4 py-2 rounded-lg shadow-rs-blue rotate-6 select-none animate-pulse z-10">
                      {t('cta_join_now')}
                    </div>
                  </div>

                </div>
              </div>

            </div>

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
