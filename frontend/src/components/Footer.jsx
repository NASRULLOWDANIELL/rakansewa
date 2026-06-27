import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="text-on-surface-variant dark:text-gray-400 border-t border-gray-150/40 dark:border-gray-800/80 transition-all duration-300">
      <div className="w-full px-6 md:px-10 lg:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-rs-blue">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
          </div>
          <span className="text-xl font-black tracking-tight text-on-surface dark:text-white font-headline">
            Rakan<span className="text-primary">Sewa</span>
          </span>
        </div>

        {/* Center: Copyright */}
        <div className="text-center text-xs text-on-surface-variant/80 dark:text-gray-500 max-w-md leading-relaxed font-medium">
          A student housing & housemate matching platform for UiTM Jasin. © 2026
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link to="/about" className="hover:text-primary transition-colors">{t('nav_about') || 'About'}</Link>
          <Link to="/properties" className="hover:text-primary transition-colors">{t('nav_properties') || 'Listings'}</Link>
          <Link to="/housemates" className="hover:text-primary transition-colors">{t('nav_housemates') || 'Matches'}</Link>
        </div>

      </div>
    </footer>
  );
}
