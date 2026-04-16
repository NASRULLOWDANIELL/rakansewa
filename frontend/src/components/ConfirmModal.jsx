const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-white/40 p-8 max-w-md w-full mx-4 transform animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-2xl">warning</span>
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface">{title || 'Are you sure?'}</h3>
        </div>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          {message || 'This action cannot be undone.'}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-error hover:bg-error/90 text-white rounded-full font-bold shadow-lg shadow-error/20 transition-all hover:scale-[1.02]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
