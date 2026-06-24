import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

/* ── Static platform stats ── */
const STATS = [
  { value: '120+', label: 'Verified Listings', icon: 'home_work' },
  { value: '400+', label: 'Students Matched', icon: 'groups' },
  { value: '100%', label: 'UiTM Verified', icon: 'verified' },
];

/* ── Feature cards data ── */
const FEATURES = [
  {
    icon: 'verified',
    iconBg: 'bg-blue-50',
    iconColor: 'text-primary',
    title: 'Verified Listings',
    desc: 'Every property is reviewed and approved by our admins before going live — no surprises.',
  },
  {
    icon: 'map',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    title: 'Distance from UiTM',
    desc: 'See exactly how far any property is from the main UiTM Jasin campus in real-time.',
  },
  {
    icon: 'diversity_3',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    title: 'Smart Housemate Matching',
    desc: 'Get matched based on budget, sleep schedule, and lifestyle — not just availability.',
  },
  {
    icon: 'shield_person',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Student Trust Indicators',
    desc: 'Verify your UiTM student identity to build credibility and connect with confidence.',
  },
];

/* ── How It Works steps ── */
const HOW_IT_WORKS = [
  { step: '01', icon: 'person_add', title: 'Create Your Profile', desc: 'Sign up with your UiTM email and set your housemate preferences.' },
  { step: '02', icon: 'search', title: 'Browse & Match', desc: 'Explore verified listings and get matched with compatible housemates.' },
  { step: '03', icon: 'chat_bubble', title: 'Connect & Move In', desc: 'Contact owners directly and secure your ideal student home.' },
];

/* ── Student CTA Card ── */
const StudentCtaCard = ({ currentUser }) => {
  const isListed = currentUser?.isListedAsHousemate;

  return (
    <div className="relative bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-10 md:p-14 text-white overflow-hidden shadow-rs-lg">
      {/* Decorative blobs */}
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
            {isListed ? 'Find Your Matching Housemate' : 'Get Listed as a Housemate'}
          </h2>
          <p className="text-lg opacity-85 max-w-xl leading-relaxed">
            {isListed
              ? 'Browse compatible students based on your set preferences and move in together.'
              : 'Complete your housemate profile so other students can find and match with you.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <Link
              to={isListed ? '/housemates' : '/profile/housemate'}
              className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">{isListed ? 'search' : 'edit'}</span>
              {isListed ? 'Browse Housemates' : 'Edit My Profile'}
            </Link>
            {isListed && (
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-white/25 transition-all duration-300 hover:scale-[1.03]"
              >
                <span className="material-symbols-outlined text-base">home</span>
                View Listings
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Guest CTA Card ── */
const GuestCtaCard = ({ currentUser }) => (
  <div className="relative bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden shadow-rs-lg">
    <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-4xl font-extrabold font-headline tracking-tight">Ready to find your new home?</h2>
      <p className="text-xl opacity-85 leading-relaxed">Join hundreds of UiTM Jasin students who found their perfect living space.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <Link
          to="/properties"
          className="bg-white text-primary px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2 justify-center"
        >
          <span className="material-symbols-outlined text-base">apartment</span>
          Browse Properties
        </Link>
        {!currentUser && (
          <Link
            to="/register"
            className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/15 hover:border-white/80 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Create Account
          </Link>
        )}
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isStudent = currentUser?.role === 'Student' || currentUser?.role === 'STUDENT';

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <div className="bg-background min-h-screen">

      {/* ─────────────────────────────
          HERO SECTION
          ───────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-background pointer-events-none" />
        {/* Decorative circles */}
        <div className="absolute top-8 right-[5%] w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] w-56 h-56 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-primary/20 px-4 py-2 rounded-full text-xs font-bold text-primary shadow-rs-sm mb-8">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            UiTM Jasin's Trusted Student Housing Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-headline leading-[1.1] tracking-tight text-on-surface mb-6 max-w-4xl mx-auto">
            Find{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Compatible Housemates</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 to-blue-400/30 rounded-full" />
            </span>
            {' '}Near UiTM Jasin
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Browse verified student rentals, get matched with compatible housemates, and secure your ideal home — all in one place.
          </p>

          {/* ── Search Bar ── */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-white rounded-2xl shadow-rs-md border border-gray-100 p-2 gap-2">
              <span className="material-symbols-outlined text-on-surface-variant ml-2 flex-shrink-0">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by city, area, or property name..."
                className="flex-1 bg-transparent outline-none text-on-surface text-sm font-medium placeholder-gray-400 py-2 px-2"
              />
              <button
                type="submit"
                className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-all hover:shadow-rs-blue flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick action pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-on-surface-variant font-medium">Quick access:</span>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-primary/30 hover:bg-blue-50/40 text-on-surface-variant hover:text-primary rounded-full text-xs font-bold transition-all shadow-rs-sm"
            >
              <span className="material-symbols-outlined text-[13px]">apartment</span>
              Browse All Properties
            </Link>
            <Link
              to="/housemates"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-primary/30 hover:bg-blue-50/40 text-on-surface-variant hover:text-primary rounded-full text-xs font-bold transition-all shadow-rs-sm"
            >
              <span className="material-symbols-outlined text-[13px]">group</span>
              Find Housemates
            </Link>
            {!currentUser && (
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-full text-xs font-bold transition-all shadow-rs-sm"
              >
                <span className="material-symbols-outlined text-[13px]">person_add</span>
                Register Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────
          STATS ROW
          ───────────────────────────── */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 md:gap-12 text-center">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                <span className="text-3xl font-black text-on-surface font-headline">{stat.value}</span>
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
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Getting Started</p>
          <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface">How RakanSewa Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-gray-100 p-7 shadow-rs-sm hover:shadow-rs-md transition-all group">
              {/* Step connector line */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3 w-6 h-0.5 bg-gray-200 z-10" />
              )}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary group-hover:shadow-rs-blue rounded-xl flex items-center justify-center transition-all duration-300">
                    <span className="material-symbols-outlined text-primary group-hover:text-white text-xl transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">{step.step}</span>
                  <h3 className="font-bold text-on-surface text-base mb-1.5 font-headline">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────
          FEATURES GRID
          ───────────────────────────── */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Platform</p>
            <h2 className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-3">Built for UiTM Students</h2>
            <p className="text-on-surface-variant text-base max-w-xl mx-auto">Everything you need to find a safe, comfortable, and compatible living situation near campus.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group bg-background hover:bg-white border border-gray-100 hover:border-gray-200 p-7 rounded-2xl transition-all duration-300 hover:shadow-rs-md text-center cursor-default"
              >
                <div className={`w-14 h-14 mx-auto ${f.iconBg} group-hover:scale-110 transition-transform duration-300 rounded-2xl flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined text-2xl ${f.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h4 className="text-base font-bold font-headline text-on-surface mb-2">{f.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
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
            <StudentCtaCard currentUser={currentUser} />
          ) : (
            <GuestCtaCard currentUser={currentUser} />
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
            A student housing & housemate matching platform for UiTM Jasin. &copy; {new Date().getFullYear()}
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
