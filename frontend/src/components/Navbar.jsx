import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getProperties, API_BASE_URL } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { lang, toggle: toggleLang, t } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStorageKey = useCallback(() => {
    if (!currentUser) return null;
    return `rakansewa_notif_seen_${currentUser.id}_${currentUser.role}`;
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const props = await getProperties();
        let notifs = [];

        if (currentUser.role === 'Student') {
          const available = props.filter(p => p.approvalStatus === 'Approved');
          if (available.length > 0) {
            notifs.push({
              id: `avail_count_${available.length}`,
              text: `${available.length} rental${available.length !== 1 ? 's' : ''} available near UiTM Jasin`,
              icon: 'apartment',
              type: 'info'
            });
          }
        } else if (currentUser.role === 'Owner') {
          const ownerProps = props.filter(p => String(p.ownerId) === String(currentUser.id));
          const approved = ownerProps.filter(p => p.approvalStatus === 'Approved');
          const rejected = ownerProps.filter(p => p.approvalStatus === 'Rejected');
          const pending = ownerProps.filter(p => p.approvalStatus === 'Pending');

          approved.forEach(p => notifs.push({ id: `approved_${p.id}`, text: `"${p.title}" has been approved`, icon: 'check_circle', type: 'success' }));
          rejected.forEach(p => notifs.push({ id: `rejected_${p.id}`, text: `"${p.title}" was rejected — view reason`, icon: 'cancel', type: 'error' }));
          if (pending.length > 0) {
            notifs.push({ id: `pending_owner_${pending.length}`, text: `${pending.length} listing${pending.length !== 1 ? 's' : ''} awaiting admin review`, icon: 'schedule', type: 'warning' });
          }
        } else if (currentUser.role === 'Admin') {
          const pending = props.filter(p => p.approvalStatus === 'Pending');
          if (pending.length > 0) {
            notifs.push({ id: `pending_admin_${pending.length}`, text: `${pending.length} listing${pending.length !== 1 ? 's' : ''} need${pending.length === 1 ? 's' : ''} approval`, icon: 'pending_actions', type: 'warning' });
          }
        }

        setNotifications(notifs);

        const storageKey = getStorageKey();
        if (storageKey) {
          const seenIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
          setNewCount(notifs.filter(n => !seenIds.includes(n.id)).length);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchNotifications();
  }, [currentUser, getStorageKey]);

  const handleBellClick = () => {
    if (!showNotifDropdown) {
      const storageKey = getStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(notifications.map(n => n.id)));
      }
      setNewCount(0);
    }
    setShowNotifDropdown(!showNotifDropdown);
    setShowUserDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getNavLinks = () => {
    if (!currentUser) return [
      { path: '/', label: t('nav_discover') },
      { path: '/housemates', label: t('nav_housemates') },
      { path: '/properties', label: t('nav_properties') },
      { path: '/about', label: t('nav_about') },
    ];
    if (currentUser.role === 'Student') return [
      { path: '/', label: t('nav_discover') },
      { path: '/properties', label: t('nav_properties') },
      { path: '/housemates', label: t('nav_housemates') },
      { path: '/feedback', label: t('nav_feedback') },
    ];
    if (currentUser.role === 'Owner') return [
      { path: '/owner', label: t('nav_dashboard') },
      { path: '/feedback', label: t('nav_feedback') },
      { path: '/about', label: t('nav_about') },
    ];
    if (currentUser.role === 'Admin') return [
      { path: '/admin', label: t('nav_admin') },
    ];
    return [];
  };

  const navLinks = getNavLinks();
  const currentFirstName = currentUser ? currentUser.name.split(' ')[0] : '';
  const userInitial = currentFirstName.charAt(0).toUpperCase();

  const notifIconColor = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-primary',
  };

  /* ── Shared small icon button style ── */
  const iconBtnClass = 'p-2 rounded-full text-on-surface-variant hover:bg-gray-100 hover:text-on-surface transition-all duration-200 flex-shrink-0';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/90 backdrop-blur-2xl shadow-rs-sm border-b border-gray-100/80'
            : 'bg-white/70 backdrop-blur-xl'
          }`}
      >
        <div className="w-full px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-between h-16 gap-2">

            {/* ── Logo ── */}
            <Link
              to={currentUser?.role === 'Admin' ? '/admin' : currentUser?.role === 'Owner' ? '/owner' : '/'}
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-rs-blue group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
              </div>
              <span className="text-xl font-black tracking-tight text-on-surface font-headline">
                Rakan<span className="text-primary">Sewa</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap ${isActive(link.path)
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-gray-100 font-medium'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1 flex-shrink-0">

              {/* Language Toggle Slider (Desktop) */}
              <button
                onClick={toggleLang}
                className="relative w-16 h-8 bg-gray-100 dark:bg-gray-850 rounded-full border border-gray-200 dark:border-gray-700/80 transition-all hover:border-primary/30 hover:bg-blue-50/10 dark:hover:bg-blue-900/10 hidden md:flex items-center justify-between px-2 cursor-pointer focus:outline-none select-none shadow-inner"
                title={lang === 'en' ? 'Tukar ke Bahasa Melayu' : 'Switch to English'}
                aria-label="Toggle language"
              >
                {/* BM Label */}
                <span className={`text-[10px] font-black tracking-wider transition-colors duration-300 ${lang === 'ms' ? 'text-primary dark:text-primary-fixed-dim' : 'text-gray-400 dark:text-gray-500'}`}>
                  BM
                </span>

                {/* EN Label */}
                <span className={`text-[10px] font-black tracking-wider transition-colors duration-300 ${lang === 'en' ? 'text-primary dark:text-primary-fixed-dim' : 'text-gray-400 dark:text-gray-500'}`}>
                  EN
                </span>

                {/* Sliding Flag Knob */}
                <div
                  className={`absolute top-0.5 left-0.5 w-[26px] h-[26px] bg-white rounded-full shadow-md overflow-hidden flex items-center justify-center transition-all duration-300 ease-out z-10 transform ${lang === 'en' ? 'translate-x-[34px]' : 'translate-x-0'
                    }`}
                >
                  <img
                    src={lang === 'en' ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/my.png'}
                    alt={lang === 'en' ? 'English' : 'Bahasa Melayu'}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDark}
                className={`${iconBtnClass} hidden md:flex`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle dark mode"
              >
                <span className="material-symbols-outlined text-xl transition-all duration-200" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Guest CTAs */}
              {!currentUser && (
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {t('nav_sign_in')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-full shadow-rs-blue hover:bg-primary/90 transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    {t('nav_get_started')}
                  </Link>
                </div>
              )}

              {/* Logged In: Bell + User */}
              {currentUser && (
                <div className="hidden md:flex items-center gap-1">

                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={handleBellClick}
                      className={iconBtnClass}
                      aria-label={t('nav_notifications')}
                    >
                      <span className="material-symbols-outlined text-xl">notifications</span>
                      {newCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                          {newCount}
                        </span>
                      )}
                    </button>

                    {showNotifDropdown && (
                      <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-rs-lg border border-gray-100 overflow-hidden animate-slide-down z-50">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-bold text-sm text-on-surface">{t('nav_notifications')}</h4>
                          <span className="text-xs text-on-surface-variant bg-gray-100 px-2 py-0.5 rounded-full">{notifications.length}</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <span className="material-symbols-outlined text-3xl text-gray-300 mb-2 block">notifications_none</span>
                              <p className="text-sm text-on-surface-variant">No notifications yet</p>
                            </div>
                          ) : (
                            <div className="p-2 space-y-1">
                              {notifications.map(n => (
                                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                  <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${notifIconColor[n.type] || 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {n.icon}
                                  </span>
                                  <span className="text-sm text-on-surface leading-snug">{n.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar Dropdown */}
                  <div className="relative ml-1" ref={userRef}>
                    <button
                      onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-primary/40 hover:bg-gray-50 transition-all duration-200"
                    >
                      {currentUser.profileImageUrl ? (
                        <img
                          src={currentUser.profileImageUrl.startsWith('/uploads')
                            ? `${API_BASE_URL}${currentUser.profileImageUrl}`
                            : currentUser.profileImageUrl}
                          alt={currentUser.name}
                          className="w-7 h-7 rounded-full object-cover shadow-sm ring-1 ring-white/40"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black shadow-sm">
                          {userInitial}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-on-surface hidden lg:block">{currentFirstName}</span>
                      <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-rs-lg border border-gray-100 overflow-hidden animate-slide-down z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-bold text-sm text-on-surface truncate">{currentUser.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{currentUser.email}</p>
                        </div>
                        <div className="p-2">
                          {currentUser.role !== 'Admin' && (
                            <Link
                              to="/profile"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-on-surface hover:bg-gray-50 transition-colors font-medium"
                            >
                              <span className="material-symbols-outlined text-base text-on-surface-variant">person</span>
                              {t('nav_profile')}
                            </Link>
                          )}
                          {currentUser.role === 'Student' && (
                            <Link
                              to="/profile/housemate"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-on-surface hover:bg-gray-50 transition-colors font-medium"
                            >
                              <span className="material-symbols-outlined text-base text-on-surface-variant">tune</span>
                              {t('nav_preferences')}
                            </Link>
                          )}
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            <span className="material-symbols-outlined text-base">logout</span>
                            {t('nav_sign_out')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive(link.path)
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-gray-50 hover:text-on-surface'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile utility controls */}
              <div className="flex items-center gap-2 pt-2 pb-1 border-t border-gray-100 mt-1">
                <button
                  onClick={toggleDark}
                  className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-gray-50 font-medium"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                {/* Language Toggle Slider (Mobile) */}
                <button
                  onClick={toggleLang}
                  className="relative w-16 h-8 bg-gray-100 dark:bg-gray-850 rounded-full border border-gray-200 dark:border-gray-700/80 transition-all flex items-center justify-between px-2 cursor-pointer focus:outline-none select-none shadow-inner"
                  title={lang === 'en' ? 'Tukar ke Bahasa Melayu' : 'Switch to English'}
                  aria-label="Toggle language"
                >
                  {/* BM Label */}
                  <span className={`text-[10px] font-black tracking-wider transition-colors duration-300 ${lang === 'ms' ? 'text-primary dark:text-primary-fixed-dim' : 'text-gray-400 dark:text-gray-500'}`}>
                    BM
                  </span>

                  {/* EN Label */}
                  <span className={`text-[10px] font-black tracking-wider transition-colors duration-300 ${lang === 'en' ? 'text-primary dark:text-primary-fixed-dim' : 'text-gray-400 dark:text-gray-500'}`}>
                    EN
                  </span>

                  {/* Sliding Flag Knob */}
                  <div
                    className={`absolute top-0.5 left-0.5 w-[26px] h-[26px] bg-white rounded-full shadow-md overflow-hidden flex items-center justify-center transition-all duration-300 ease-out z-10 transform ${lang === 'en' ? 'translate-x-[34px]' : 'translate-x-0'
                      }`}
                  >
                    <img
                      src={lang === 'en' ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/my.png'}
                      alt={lang === 'en' ? 'English' : 'Bahasa Melayu'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </button>
              </div>

              {currentUser ? (
                <>
                  <hr className="border-gray-100 my-1" />
                  {currentUser.role !== 'Admin' && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-on-surface hover:bg-gray-50 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-base">person</span>
                      {t('nav_profile')}
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogoutClick(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    {t('nav_sign_out')}
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-gray-100 my-1" />
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-gray-50 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav_sign_in')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-sm text-white bg-primary font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav_get_started')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-rs-lg border border-gray-100 p-8 max-w-sm w-full mx-4 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-red-500 text-xl">logout</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-lg">Sign out?</h3>
                <p className="text-sm text-on-surface-variant">You'll need to sign in again.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface rounded-xl font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg"
              >
                {t('nav_sign_out')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
