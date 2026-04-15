import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-fixed text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Trusted by 5,000+ UiTM Jasin Students
            </div>
            <h1 className="text-6xl font-extrabold font-headline leading-[1.1] tracking-tighter text-on-surface">
              Find your <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">sanctuary</span> near campus.
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg">
              Say goodbye to stressful housing hunts. Discover curated homes and compatible housemates in Jasin, designed specifically for the student lifestyle.
            </p>
            {/* Search Bar (Bento style) */}
            <div className="glass p-3 rounded-xl shadow-[0_40px_60px_-10px_rgba(25,28,30,0.08)] border border-white/40 flex flex-col md:flex-row gap-2">
              <div className="flex-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-lowest/50 rounded-lg transition-all cursor-pointer">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">Location</span>
                  <span className="text-sm font-semibold">UiTM Jasin Area</span>
                </div>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-lowest/50 rounded-lg transition-all cursor-pointer">
                 <span className="material-symbols-outlined text-primary">payments</span>
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">Price Range</span>
                    <span className="text-sm font-semibold">RM 200 - 500</span>
                 </div>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-lowest/50 rounded-lg transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-primary">home_work</span>
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">Property Type</span>
                     <span className="text-sm font-semibold">Terrace House</span>
                  </div>
              </div>
              <Link to="/properties" className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-transform flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined">search</span> Search
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl"></div>
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="space-y-4 pt-12">
                 <div className="rounded-lg overflow-hidden h-64 shadow-xl">
                   <img className="w-full h-full object-cover" alt="Student bedroom" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlzch-g4Wq3SoUZ0Muax8Z3u7uaMLIVb6fZN0TVmcmfea0Om8tmIcI7i-emAKhL_neSO6gmhsbHJUuaMUPXTKN03vbtIJhGrBk4miPpOsN_N4az14c3r1N75R2N-Q5AF1cmZTX8JQa_2x_Qk674i_-XIXp7IP0FbiZjnkiJHGgmiPZrPKWRJolvD9cd9DaxbaxIc9MIT_SETHHk76l42d3WjM3x-kZSxiZa0FLNsmm2yIXpK1aEPBi2JlbbU18Egjv965CCXl1_aOI"/>
                 </div>
                 <div className="glass p-6 rounded-lg shadow-lg border border-white/20">
                   <span className="text-tertiary font-bold flex items-center gap-2 mb-2">
                       <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span> 4.9 Rating
                   </span>
                   <p className="text-sm font-medium text-on-surface">"Found my best housemates here!"</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="glass p-4 rounded-lg flex items-center gap-4 shadow-lg border border-white/20">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                       <span className="material-symbols-outlined text-primary">verified_user</span>
                    </div>
                    <div className="text-xs">
                       <p className="font-bold">Verified Listings</p>
                       <p className="text-on-surface-variant">Direct from landlords</p>
                    </div>
                 </div>
                 <div className="rounded-lg overflow-hidden h-80 shadow-xl">
                    <img className="w-full h-full object-cover" alt="Living room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2m5M3SgvAEbeoINE7VReKL_h30HWZkONFAQgx-73QjuMY_0IY0UK90-sxCFpSmrgwe2t0u-8gox1pYjeiZ9qeXIk7R6AZH5zmi6hPkBcUDWnW17H6U5Yx5su8ofkzKBIhudrjaaiTGGj6wFWeDfo6kRT6qr5y9p807mBB5VxnTjXqiiPTB0w_d8F1UnBDpsVZEIwAgEAbUJFNJLmvRVidaUw921PgcNtfyhYrBC3W6Rz_iK61C-j03j1HdAggTSWZBQmve7UyRdYN"/>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
          <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary to-primary-container rounded-lg p-12 text-white relative overflow-hidden flex flex-col justify-end group">
             <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                <img className="w-full h-full object-cover" alt="Students studying" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmLIZsx1j67maTfcV6Jk4A9FKakEM7gmOAOC7ggmm_h3krSlLE9Uc4z8FB6KcscrtsQ--leC-WLHmVRZaIvxHhFIlC3Wy-1AA1IY4WFlMLgHBEZJ2RSxwdH2x6AM46yOaYTehdi3-8GAa1ieMj65-SvqYjImcrqXVQJIRsS1BTd7E_qg_IvPfYbDPANNMDwG9zcboLRqTe-uJ_cucsVPyrafYjVVnHZq6kikaKURcXYDbqYZsNWI9eVuCvNC2QcgY0sknUjqcNiF7Y"/>
             </div>
             <div className="relative z-10 space-y-6 max-w-lg">
                <h2 className="text-5xl font-bold font-headline tracking-tighter leading-none">Find housemates as cool as you.</h2>
                <p className="text-lg opacity-90 leading-relaxed">Our AI-driven matching system connects you with fellow students based on lifestyle habits, faculty, and interests.</p>
                <Link to="/properties" className="inline-block bg-white text-primary px-8 py-4 rounded-full font-bold shadow-xl hover:bg-surface-bright transition-all">Match Me Now</Link>
             </div>
          </div>
          <div className="bg-surface-container-high rounded-lg p-8 flex flex-col justify-between group overflow-hidden">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                   <span className="material-symbols-outlined">verified</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:translate-x-1 transition-transform">arrow_outward</span>
             </div>
             <div>
                <h4 className="text-xl font-bold font-headline mb-2">Verified Landlords</h4>
                <p className="text-sm text-on-surface-variant">Every property is physically inspected for student safety.</p>
             </div>
          </div>
          <div className="bg-tertiary-fixed rounded-lg p-8 flex flex-col justify-between group overflow-hidden">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-tertiary shadow-sm">
                   <span className="material-symbols-outlined">history_edu</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:translate-x-1 transition-transform">arrow_outward</span>
             </div>
             <div>
                <h4 className="text-xl font-bold font-headline mb-2">Legal Support</h4>
                <p className="text-sm text-on-surface-variant">Digital tenancy agreements reviewed for student rights.</p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto glass p-16 rounded-xl text-center border border-white/40 shadow-2xl space-y-8">
           <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Ready to find your new home?</h2>
           <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">Join thousands of UiTM Jasin students who found their perfect living space with RakanSewa.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/properties" className="bg-primary text-white px-10 py-5 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all">Start Searching</Link>
              <button className="bg-white border-2 border-outline-variant/30 text-on-surface px-10 py-5 rounded-full font-bold text-lg hover:bg-surface-container-low transition-all">Register Housemate Profile</button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
