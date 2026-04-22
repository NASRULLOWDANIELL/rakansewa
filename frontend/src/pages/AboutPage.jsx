import React from 'react';

const AboutPage = () => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold font-headline text-on-surface">About <span className="text-primary">RakanSewa</span></h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          A dedicated platform helping UiTM Jasin students find reliable housing and compatible housemates.
        </p>
      </div>

      <div className="glass p-10 rounded-2xl shadow-xl border border-white/40 space-y-8 text-on-surface">
        <section>
          <h2 className="text-2xl font-bold font-headline text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">school</span> Project Information
          </h2>
          <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
            <p><span className="font-bold w-32 inline-block">Project Name:</span> RakanSewa: Housemate Matching and Rental House Information Finder System</p>
            <p><span className="font-bold w-32 inline-block">Developer:</span> Nasrul Low Daniell Bin Mohamad Amirul Asri Low</p>
            <p><span className="font-bold w-32 inline-block">University:</span> Universiti Teknologi MARA (UiTM) Cawangan Melaka, Kampus Jasin</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-headline text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">lightbulb</span> The Problem & Solution
          </h2>
          <div className="space-y-4 text-on-surface-variant leading-relaxed">
            <p>
              <strong className="text-on-surface">The Problem:</strong> Finding secure off-campus accommodation and compatible housemates is often a stressful process for university students. Many face issues such as unverified listings, scam landlords, and mismatched housemates with conflicting lifestyles.
            </p>
            <p>
              <strong className="text-on-surface">The Solution:</strong> RakanSewa provides a centralized, secure platform exclusively designed for UiTM students. It tackles these challenges by incorporating features like landlord verification, student identity trust badges, distance checking to UiTM Jasin, and an intelligent housemate compatibility system based on budget and lifestyle preferences.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
