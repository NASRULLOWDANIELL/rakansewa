import { useState } from 'react';

const PRESET_REASONS = [
  'Missing property image',
  'Incomplete property information',
  'Invalid rental details',
  'Duplicate listing',
];

const RejectModal = ({ isOpen, propertyTitle, onConfirm, onCancel }) => {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const finalReason = selectedPreset === '__custom__'
    ? customReason.trim()
    : selectedPreset;

  const canSubmit = finalReason.length > 0;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(finalReason);
      setSelectedPreset('');
      setCustomReason('');
    }
  };

  const handleCancel = () => {
    setSelectedPreset('');
    setCustomReason('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleCancel}>
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-white/40 p-8 max-w-lg w-full mx-4 transform animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-2xl">block</span>
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface">Reject Property</h3>
            <p className="text-sm text-on-surface-variant">{propertyTitle}</p>
          </div>
        </div>

        {/* Preset reasons */}
        <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Select a reason</p>
        <div className="space-y-2 mb-4">
          {PRESET_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all ${
                selectedPreset === reason
                  ? 'bg-error/10 border-error/30 text-on-surface'
                  : 'bg-surface-container-low border-transparent hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <input
                type="radio"
                name="reject-reason"
                value={reason}
                checked={selectedPreset === reason}
                onChange={() => setSelectedPreset(reason)}
                className="accent-error w-4 h-4"
              />
              <span className="text-sm font-medium">{reason}</span>
            </label>
          ))}

          {/* Custom reason option */}
          <label
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all ${
              selectedPreset === '__custom__'
                ? 'bg-error/10 border-error/30 text-on-surface'
                : 'bg-surface-container-low border-transparent hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <input
              type="radio"
              name="reject-reason"
              value="__custom__"
              checked={selectedPreset === '__custom__'}
              onChange={() => setSelectedPreset('__custom__')}
              className="accent-error w-4 h-4"
            />
            <span className="text-sm font-medium">Other reason...</span>
          </label>
        </div>

        {/* Custom reason textarea */}
        {selectedPreset === '__custom__' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Enter your rejection reason..."
            rows={3}
            className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface placeholder:text-on-surface-variant/50 mb-4 focus:outline-none focus:ring-2 focus:ring-error/30 border border-surface-container-high"
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`px-6 py-2.5 rounded-full font-bold shadow-lg transition-all ${
              canSubmit
                ? 'bg-error hover:bg-error/90 text-white shadow-error/20 hover:scale-[1.02]'
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed shadow-none'
            }`}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
