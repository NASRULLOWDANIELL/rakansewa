import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

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
              <Link className={getLinkClass('/profile')} to="/profile">Profile</Link>
            </>
          )}

          {currentUser?.role === 'Owner' && (
             <>
               <Link className={getLinkClass('/owner')} to="/owner">Dashboard</Link>
               <Link className={getLinkClass('/profile')} to="/profile">Profile</Link>
             </>
          )}

          {currentUser?.role === 'Admin' && (
             <>
               <Link className={getLinkClass('/admin')} to="/admin">Dashboard</Link>
             </>
          )}
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">notifications</button>
            <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
              <span className="hidden lg:block text-sm font-bold text-on-surface">{currentUser.name}</span>
              <div className="w-10 h-10 rounded-full bg-primary-fixed-dim overflow-hidden flex items-center justify-center text-on-primary-fixed font-bold">
                 {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="material-symbols-outlined text-error hover:bg-error-container p-2 rounded-full transition-colors" title="Logout">logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
