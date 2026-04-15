import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getProperties } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const props = await getProperties();
        let notifs = [];
        
        if (currentUser.role === 'Student') {
          const available = props.filter(p => p.availabilityStatus === 'Available');
          if (available.length > 0) {
            notifs.push({ id: 1, text: `${available.length} rental properties are currently available to view!` });
          }
        } else if (currentUser.role === 'Owner') {
          const approved = props.filter(p => p.availabilityStatus === 'Available');
          const pending = props.filter(p => p.availabilityStatus === 'Pending');
          if (pending.length > 0) {
            notifs.push({ id: 1, text: `You have ${pending.length} properties waiting for admin approval.` });
          }
          if (approved.length > 0) {
            notifs.push({ id: 2, text: `${approved.length} of your properties have been approved and are active!` });
          }
        } else if (currentUser.role === 'Admin') {
          const pending = props.filter(p => p.availabilityStatus === 'Pending');
          if (pending.length > 0) {
             notifs.push({ id: 1, text: `${pending.length} properties are pending your approval.` });
          }
        }
        
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-primary dark:text-primary-container font-extrabold border-b-2 border-primary hover:text-primary/80 transition-colors duration-300"
      : "text-on-surface-variant hover:text-primary transition-colors duration-300";
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentFirstName = currentUser ? currentUser.name.split(' ')[0] : '';

  return (
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
            
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative">
                notifications
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full block"></span>
                )}
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-12 w-72 bg-surface-container-lowest glass rounded-xl shadow-xl border border-white/40 p-4 z-50">
                   <h4 className="font-bold border-b border-surface-container-low pb-2 mb-2 text-on-surface">Notifications</h4>
                   {notifications.length === 0 ? (
                      <p className="text-sm text-on-surface-variant p-2">No new notifications.</p>
                   ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {notifications.map(n => (
                           <div key={n.id} className="text-sm bg-surface-container-low p-3 rounded-lg text-on-surface">
                              {n.text}
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
              <button onClick={handleLogout} className="material-symbols-outlined text-error hover:bg-error-container p-2 rounded-full transition-colors" title="Logout">logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
