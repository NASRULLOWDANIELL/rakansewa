import { useLanguage } from '../context/LanguageContext';

const UnsavedChangesModal = ({ isOpen, onSave, onDiscard, onCancel }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-white/40 p-8 max-w-md w-full mx-4 transform animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-error text-2xl">warning</span>
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface">{t('unsaved_title')}</h3>
        </div>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          {t('unsaved_msg')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full font-bold transition-all text-center"
          >
            {t('unsaved_cancel')}
          </button>
          <button
            onClick={onDiscard}
            className="px-6 py-2.5 bg-error/10 dark:bg-error/20 text-error dark:text-red-400 hover:bg-error hover:text-white dark:hover:bg-error dark:hover:text-white rounded-full font-bold transition-all text-center border border-error/20"
          >
            {t('unsaved_discard')}
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] text-center"
          >
            {t('unsaved_save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
