import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getProperties } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Generate a stable notification key for localStorage
  const getStorageKey = useCallback(() => {
    if (!currentUser) return null;
    return `rakansewa_notif_seen_${currentUser.id}_${currentUser.role}`;
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
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
              text: `${available.length} rental${available.length !== 1 ? 's' : ''} available for you`,
              icon: 'apartment'
            });
          }
        } else if (currentUser.role === 'Owner') {
          const ownerProps = props.filter(p => String(p.ownerId) === String(currentUser.id));
          const approved = ownerProps.filter(p => p.approvalStatus === 'Approved');
          const rejected = ownerProps.filter(p => p.approvalStatus === 'Rejected');
          const pending = ownerProps.filter(p => p.approvalStatus === 'Pending');
          
          approved.forEach(p => {
            notifs.push({ 
              id: `approved_${p.id}`, 
              text: `"${p.title}" has been approved`,
              icon: 'check_circle'
            });
          });
          rejected.forEach(p => {
            notifs.push({ 
              id: `rejected_${p.id}`, 
              text: `"${p.title}" was rejected — view reason`,
              icon: 'cancel'
            });
          });
          if (pending.length > 0) {
            notifs.push({
              id: `pending_owner_${pending.length}`,
              text: `${pending.length} listing${pending.length !== 1 ? 's' : ''} awaiting admin review`,
              icon: 'schedule'
            });
          }
        } else if (currentUser.role === 'Admin') {
          const pending = props.filter(p => p.approvalStatus === 'Pending');
          if (pending.length > 0) {
            notifs.push({ 
              id: `pending_admin_${pending.length}`, 
              text: `${pending.length} property listing${pending.length !== 1 ? 's' : ''} need${pending.length === 1 ? 's' : ''} approval`,
              icon: 'pending_actions'
            });
          }
        }
        
        setNotifications(notifs);

        // Calculate NEW count based on last seen
        const storageKey = getStorageKey();
        if (storageKey) {
          const seenIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const unseenCount = notifs.filter(n => !seenIds.includes(n.id)).length;
          setNewCount(unseenCount);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, [currentUser, getStorageKey]);

  const handleBellClick = () => {
    if (!showDropdown) {
      // Mark all as seen when opening
      const storageKey = getStorageKey();
      if (storageKey) {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem(storageKey, JSON.stringify(allIds));
      }
      setNewCount(0);
    }
    setShowDropdown(!showDropdown);
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-primary dark:text-primary-container font-extrabold border-b-2 border-primary hover:text-primary/80 transition-colors duration-300"
      : "text-on-surface-variant hover:text-primary transition-colors duration-300";
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const currentFirstName = currentUser ? currentUser.name.split(' ')[0] : '';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.04)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary dark:text-primary-container font-headline border-none">
            RakanSewa
          </Link>
          <div className="hidden md:flex items-center gap-8 font-['Plus_Jakarta_Sans'] font-medium tracking-tight">
            {!currentUser && (
              <>
                <Link className={getLinkClass('/')} to="/">Home</Link>
                <Link className={getLinkClass('/login')} to="/login">Login</Link>
                <Link className={getLinkClass('/register')} to="/register">Register</Link>
              </>
            )}

            {currentUser?.role === 'Student' && (
              <>
                <Link className={getLinkClass('/')} to="/">Home</Link>
                <Link className={getLinkClass('/properties')} to="/properties">Properties</Link>
                <Link className={getLinkClass('/housemates')} to="/housemates">Housemates</Link>
              </>
            )}

            {currentUser?.role === 'Owner' && (
               <>
                 <Link className={getLinkClass('/owner')} to="/owner">Dashboard</Link>
               </>
            )}

            {currentUser?.role === 'Admin' && (
               <>
                 <Link className={getLinkClass('/admin')} to="/admin">Dashboard</Link>
               </>
            )}
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-4 relative">
              
              <div className="relative" ref={dropdownRef}>
                <button onClick={handleBellClick} className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative">
                  notifications
                  {newCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                      {newCount}
                    </span>
                  )}
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest glass rounded-xl shadow-2xl border border-white/40 p-4 z-50">
                     <h4 className="font-bold border-b border-surface-container-low pb-2 mb-2 text-on-surface flex items-center justify-between">
                       Notifications
                       <span className="text-xs font-normal text-on-surface-variant">{notifications.length} total</span>
                     </h4>
                     {notifications.length === 0 ? (
                        <p className="text-sm text-on-surface-variant p-4 text-center">No notifications yet.</p>
                     ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {notifications.map(n => (
                             <div key={n.id} className="text-sm bg-surface-container-low p-3 rounded-lg text-on-surface flex items-start gap-3 hover:bg-surface-container transition-colors">
                                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                                <span className="leading-snug">{n.text}</span>
                             </div>
                          ))}
                        </div>
                     )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-decoration-none">
                  <span className="hidden lg:block text-sm font-bold text-on-surface">{currentFirstName}</span>
                  <div className="w-10 h-10 rounded-full bg-primary-fixed-dim overflow-hidden flex items-center justify-center text-on-primary-fixed font-bold shadow-sm">
                     {currentFirstName.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogoutClick} className="material-symbols-outlined text-error hover:bg-error-container p-2 rounded-full transition-colors" title="Logout">logout</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}>
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-white/40 p-8 max-w-sm w-full mx-4 transform animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-2xl">logout</span>
              </div>
              <h3 className="text-xl font-bold font-headline text-on-surface">Logout</h3>
            </div>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-6 py-2.5 bg-error hover:bg-error/90 text-white rounded-full font-bold shadow-lg shadow-error/20 transition-all hover:scale-[1.02]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
