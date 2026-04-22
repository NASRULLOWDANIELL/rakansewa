import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <div className="space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline leading-[1.1] tracking-tighter text-on-surface">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">Verified Rentals</span> and Housemates Near UiTM Jasin
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            A centralized platform for UiTM students to discover trusted rental listings and compatible housemates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
             <Link to="/properties" className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">search</span> Browse Properties
             </Link>
             <Link to="/housemates" className="bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">group</span> Find Housemates
             </Link>
             {!currentUser && (
               <Link to="/register" className="bg-white border-2 border-outline-variant/30 text-on-surface px-8 py-4 rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
                  Register
               </Link>
             )}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-surface-container-low">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface">Platform Features</h2>
           <p className="text-on-surface-variant mt-4">Built to ensure trust and convenience for UiTM students.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="glass p-8 rounded-2xl border border-white/40 text-center hover:scale-105 transition-transform">
             <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">verified</span>
             </div>
             <h4 className="text-xl font-bold font-headline mb-3 text-on-surface">Verified Property Listings</h4>
             <p className="text-sm text-on-surface-variant">All properties are reviewed and approved by administrators before being listed.</p>
          </div>
          <div className="glass p-8 rounded-2xl border border-white/40 text-center hover:scale-105 transition-transform">
             <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">map</span>
             </div>
             <h4 className="text-xl font-bold font-headline mb-3 text-on-surface">Distance from UiTM Jasin</h4>
             <p className="text-sm text-on-surface-variant">See exactly how far properties are from the main campus using precise location mapping.</p>
          </div>
          <div className="glass p-8 rounded-2xl border border-white/40 text-center hover:scale-105 transition-transform">
             <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">diversity_3</span>
             </div>
             <h4 className="text-xl font-bold font-headline mb-3 text-on-surface">Housemate Matching</h4>
             <p className="text-sm text-on-surface-variant">Find compatible housemates based on lifestyle, budget, and sleep schedule preferences.</p>
          </div>
          <div className="glass p-8 rounded-2xl border border-white/40 text-center hover:scale-105 transition-transform">
             <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">shield_person</span>
             </div>
             <h4 className="text-xl font-bold font-headline mb-3 text-on-surface">Student Trust Indicators</h4>
             <p className="text-sm text-on-surface-variant">Verify yourself as a UiTM student to build trust within the RakanSewa community.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-container p-12 md:p-16 rounded-3xl text-center text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight">Ready to find your new home?</h2>
              <p className="text-xl max-w-2xl mx-auto opacity-90">Join thousands of UiTM Jasin students who found their perfect living space with RakanSewa.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                 <Link to="/properties" className="bg-white text-primary px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all">Browse Properties</Link>
                 {!currentUser && (
                    <Link to="/register" className="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-all">Create Account</Link>
                 )}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
