import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();
  const isStudent = currentUser?.role === 'Student' || currentUser?.role === 'STUDENT';

  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <div className="space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline leading-[1.1] tracking-tighter text-on-surface">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">Compatible Housemates</span> Near UiTM Jasin
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Browse compatible students, discover where they are staying, and find your ideal living arrangement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
             <Link 
               to="/housemates" 
               className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 transition-all duration-300 ease-out flex items-center justify-center gap-2 hover:bg-primary/85 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.04] active:scale-[0.98] cursor-pointer"
             >
                <span className="material-symbols-outlined text-sm">group</span> Find Housemates
             </Link>
             <Link 
               to="/properties" 
               className="bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-bold border-2 border-transparent transition-all duration-300 ease-out flex items-center justify-center gap-2 hover:bg-surface-container-highest hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.04] active:scale-[0.98] cursor-pointer"
             >
                <span className="material-symbols-outlined text-sm">search</span> Browse Properties
             </Link>
             {!currentUser && (
               <Link to="/register" className="bg-white border-2 border-outline-variant/30 text-on-surface px-8 py-4 rounded-full font-bold transition-all duration-300 ease-out flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary/30 hover:shadow-md hover:scale-[1.04] active:scale-[0.98] cursor-pointer">
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

      {/* Dynamic CTA Section — personalized for students, generic for guests */}
      <section className="py-24 px-6">
        {isStudent ? (
          <StudentCtaCard currentUser={currentUser} />
        ) : (
          /* Guest / non-student CTA */
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-container p-12 md:p-16 rounded-3xl text-center text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-8">
                <h2 className="text-4xl font-extrabold font-headline tracking-tight">Ready to find your new home?</h2>
                <p className="text-xl max-w-2xl mx-auto opacity-90">Join thousands of UiTM Jasin students who found their perfect living space with RakanSewa.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                   <Link to="/properties" className="bg-white text-primary px-10 py-5 rounded-full font-bold text-lg shadow-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-[0.98] cursor-pointer">Browse Properties</Link>
                   {!currentUser && (
                      <Link to="/register" className="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/80 hover:scale-[1.04] active:scale-[0.98] cursor-pointer">Create Account</Link>
                   )}
                </div>
             </div>
          </div>
        )}
      </section>
    </div>
  );
};

/**
 * Dynamic CTA card for students.
 * Shows different content based on whether the student is listed as a housemate.
 */
const StudentCtaCard = ({ currentUser }) => {
  const isListed = currentUser?.isListedAsHousemate;

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-container p-12 md:p-16 rounded-3xl text-white shadow-2xl relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Icon area */}
        <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <span className="material-symbols-outlined text-5xl md:text-6xl text-white/90">
            {isListed ? 'groups' : 'person_add'}
          </span>
        </div>

        {/* Content */}
        <div className="text-center md:text-left flex-grow space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">
            {isListed
              ? 'Find Your Matching Housemate'
              : 'Want to get listed as a housemate?'}
          </h2>
          <p className="text-lg opacity-90 max-w-xl">
            {isListed
              ? 'Browse the housemate listing to discover compatible housemates based on your preferences.'
              : 'Complete your housemate profile to appear in the housemate listing and improve your chances of finding a compatible roommate.'}
          </p>
          <div className="pt-2">
            <Link
              to={isListed ? '/housemates' : '/profile'}
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">
                {isListed ? 'search' : 'edit'}
              </span>
              {isListed ? 'Find Housemates' : 'Edit Profile'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
