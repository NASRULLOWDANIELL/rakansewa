import React from 'react';

const AboutPage = () => {
  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8 pb-4 border-b border-outline-variant/20">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          About <span className="text-primary">RakanSewa</span>
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          A dedicated platform helping UiTM Jasin students find reliable housing and compatible housemates.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Project info card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <div className="bg-white border border-outline-variant/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              Project Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Project Name', value: 'RakanSewa: Housemate Matching and Rental House Information Finder System' },
                { label: 'Developer', value: 'Nasrul Low Daniell Bin Mohamad Amirul Asri Low' },
                { label: 'University', value: 'Universiti Teknologi MARA (UiTM) Cawangan Melaka, Kampus Jasin' },
                { label: 'Platform', value: 'Web-Based System (React + Spring Boot)' },
              ].map(item => (
                <div key={item.label} className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{item.label}</p>
                  <p className="text-sm text-on-surface font-medium leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Problem & Solution */}
          <div className="bg-white border border-outline-variant/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              Problem &amp; Solution
            </h2>
            <div className="space-y-5">
              <div className="bg-red-50 border border-red-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">report_problem</span>
                  <h3 className="font-bold text-red-700 text-sm">The Problem</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Finding secure off-campus accommodation and compatible housemates is often a stressful process for university students. Many face issues such as unverified listings, scam landlords, and mismatched housemates with conflicting lifestyles.
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                  <h3 className="font-bold text-green-700 text-sm">The Solution</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  RakanSewa provides a centralized, secure platform exclusively designed for UiTM students. It addresses these challenges through landlord verification, student identity trust badges, and an intelligent housemate compatibility system based on budget and lifestyle preferences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key features & tech stack */}
        <div className="space-y-6">
          {/* Key Features */}
          <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">star</span>
              Key Features
            </h2>
            <ul className="space-y-3">
              {[
                { icon: 'verified', text: 'UiTM Student Verification' },
                { icon: 'home_work', text: 'Property Listing & Approval' },
                { icon: 'people', text: 'Housemate Matching System' },
                { icon: 'manage_accounts', text: 'Admin Approval Workflow' },
                { icon: 'feedback', text: 'User Feedback System' },
              ].map(f => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-primary/70 text-[18px] flex-shrink-0">{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold font-headline text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">code</span>
              Technology Stack
            </h2>
            <div className="space-y-2">
              {[
                { layer: 'Frontend', tech: 'React + Vite + Tailwind CSS' },
                { layer: 'Backend', tech: 'Spring Boot (Java)' },
                { layer: 'Database', tech: 'MySQL' },
                { layer: 'Auth', tech: 'JWT (Role-Based)' },
              ].map(t => (
                <div key={t.layer} className="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.layer}</span>
                  <span className="text-sm text-on-surface font-medium text-right">{t.tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact / Supervisor note */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">info</span>
              <p className="text-sm font-bold text-primary">Academic Project</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This system is developed as part of an undergraduate final year project at UiTM Cawangan Melaka, Kampus Jasin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
