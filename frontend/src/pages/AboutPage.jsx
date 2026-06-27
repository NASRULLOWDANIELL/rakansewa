import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 lg:px-16 w-full mx-auto">
      {/* Page header */}
      <div className="mb-8 pb-4 border-b border-outline-variant/20">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          {t('about_title').split(' ')[0]} <span className="text-primary">{t('about_title').split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {t('about_subtitle')}
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
              {t('about_proj_info')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: t('about_proj_name'), value: t('about_proj_name_val') },
                { label: t('about_dev'), value: 'Nasrul Low Daniell Bin Mohamad Amirul Asri Low' },
                { label: t('about_univ'), value: t('about_univ_val') },
                { label: t('about_platform'), value: t('about_platform_val') },
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
              {t('about_prob_sol')}
            </h2>
            <div className="space-y-5">
              <div className="bg-red-50 border border-red-100 rounded-lg p-5 shadow-rs-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">report_problem</span>
                  <h3 className="font-bold text-red-700 text-sm">{t('about_prob_title')}</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t('about_prob_desc')}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 shadow-rs-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                  <h3 className="font-bold text-emerald-700 text-sm">{t('about_sol_title')}</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t('about_sol_desc')}
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
              {t('about_key_features')}
            </h2>
            <ul className="space-y-3">
              {[
                { icon: 'verified', text: t('about_feat_verification') },
                { icon: 'home_work', text: t('about_feat_listing') },
                { icon: 'people', text: t('about_feat_matching') },
                { icon: 'manage_accounts', text: t('about_feat_admin') },
                { icon: 'feedback', text: t('about_feat_feedback') },
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
              {t('about_tech_stack')}
            </h2>
            <div className="space-y-2">
              {[
                { layer: 'Frontend', tech: 'React + Vite + Tailwind CSS' },
                { layer: 'Backend', tech: 'Spring Boot (Java)' },
                { layer: 'Database', tech: 'MySQL' },
                { layer: 'Auth', tech: 'JWT (Role-Based)' },
              ].map(item => (
                <div key={item.layer} className="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{item.layer}</span>
                  <span className="text-sm text-on-surface font-medium text-right">{item.tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact / Supervisor note */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">info</span>
              <p className="text-sm font-bold text-primary">{t('about_academic_proj')}</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t('about_academic_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
