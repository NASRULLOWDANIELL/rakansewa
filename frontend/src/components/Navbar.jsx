import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-blue-700 dark:text-blue-300 font-bold border-b-2 border-blue-600 hover:text-blue-500 transition-colors duration-300"
      : "text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors duration-300";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.04)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-600 dark:text-blue-400 font-headline">
          RakanSewa
        </Link>
        <div className="hidden md:flex items-center gap-8 font-['Plus_Jakarta_Sans'] font-medium tracking-tight">
          <Link className={getLinkClass('/')} to="/">Home</Link>
          <Link className={getLinkClass('/properties')} to="/properties">Properties</Link>
          <Link className={getLinkClass('/housemates')} to="/properties">Housemates</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">notifications</button>
          <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
            <span className="hidden lg:block text-sm font-medium text-on-surface">Profile</span>
            <div className="w-10 h-10 rounded-full bg-primary-fixed-dim overflow-hidden">
              <img className="w-full h-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2D9xzIL1C6M_gz9raYsnjzl9VJ4SR4XGk0JhyWurbhsoiJM9X0Lp7Ty1znGNFSxE7wZR9PN72RXpkRJDKOVuk3v8D1ZLYn8Cr7RoOPGOHZNjRAetP-9KGbOQtZ6qpJh0WvBqH-MtcItMnPVZmChwg_RgkRDqjCD7E_IcIjXAJTsXXedT7BGrOz74rOeNKM5B2V-gLyFOiNb2uAYSjTgUPtGG_bvhd17f2zJ_s-lpVJ7k5wNXM-6EqIB34Hb2XfVVxTkELNpxAiu-F" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
