import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { getPropertiesByOwner, deleteProperty, createProperty, updateProperty, resubmitProperty, uploadPropertyImages, deletePropertyImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import UnsavedChangesModal from '../components/UnsavedChangesModal';
import { useLanguage } from '../context/LanguageContext';

/* ── Status badge helper ── */
const StatusBadge = ({ status }) => {
  const config = {
    Approved: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'check_circle' },
    Rejected: { style: 'bg-red-50 text-red-700 border-red-200', icon: 'cancel' },
    Pending: { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'schedule' },
  };
  const { style, icon } = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style}`}>
      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      {status}
    </span>
  );
};

const OwnerDashboard = () => {
  const { currentUser, isUitmVerified } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingWasRejected, setEditingWasRejected] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '', description: '', address: '', city: '', state: '',
    monthlyRent: '', roomType: 'Single', propertyType: 'Apartment',
    furnishedStatus: 'Fully Furnished', availabilityStatus: 'Pending',
    imageUrl: ''
  });

  const blocker = useBlocker(
    ({ nextLocation }) => isDirty && showForm && !uploading
  );

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && showForm) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, showForm]);

  useEffect(() => {
    if (currentUser?.id) fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm]);

  const fetchProperties = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const data = await getPropertiesByOwner(currentUser.id);
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching owner properties:', err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    setIsDirty(true);
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const previews = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...previews]);
    setIsDirty(true);
  };

  const removeNewPreview = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleDeleteExistingImage = async (imageId) => {
    try {
      await deletePropertyImage(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      setIsDirty(true);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const startEdit = (property) => {
    setFormData({
      title: property.title || '',
      description: property.description || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      monthlyRent: property.monthlyRent || '',
      roomType: property.roomType || 'Single',
      propertyType: property.propertyType || 'Apartment',
      furnishedStatus: property.furnishedStatus || 'Fully Furnished',
      availabilityStatus: property.availabilityStatus || 'Pending',
      imageUrl: property.imageUrl || ''
    });
    setImageFiles([]);
    setImagePreviews([]);
    const imgs = property.images?.length > 0 ? property.images : (property.imageUrl ? [{ id: null, imageUrl: property.imageUrl }] : []);
    setExistingImages(imgs);
    setEditingId(property.id);
    setEditingWasRejected(property.approvalStatus === 'Rejected');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', address: '', city: '', state: '', monthlyRent: '', roomType: 'Single', propertyType: 'Apartment', furnishedStatus: 'Fully Furnished', availabilityStatus: 'Pending', imageUrl: '' });
    setFormErrors({});
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingId(null);
    setEditingWasRejected(false);
    setShowForm(false);
    setIsDirty(false);
  };

  const handleSubmit = async (e, proceedAfterSave = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormErrors({});
    setSaveError(null);

    const tempErrors = {};
    const trimmedTitle = (formData.title || '').trim();
    const trimmedAddress = (formData.address || '').trim();
    const trimmedCity = (formData.city || '').trim();
    const trimmedState = (formData.state || '').trim();
    const rentVal = formData.monthlyRent !== null && formData.monthlyRent !== undefined ? formData.monthlyRent.toString().trim() : '';
    const trimmedDesc = (formData.description || '').trim();

    if (!trimmedTitle) {
      tempErrors.title = t('val_err_required');
    } else if (trimmedTitle.length > 100) {
      tempErrors.title = t('val_err_too_long', { max: 100 });
    }

    if (!trimmedAddress) {
      tempErrors.address = t('val_err_required');
    } else if (trimmedAddress.length > 200) {
      tempErrors.address = t('val_err_too_long', { max: 200 });
    }

    if (!trimmedCity) {
      tempErrors.city = t('val_err_required');
    } else if (trimmedCity.length > 50) {
      tempErrors.city = t('val_err_too_long', { max: 50 });
    }

    if (!trimmedState) {
      tempErrors.state = t('val_err_required');
    } else if (trimmedState.length > 50) {
      tempErrors.state = t('val_err_too_long', { max: 50 });
    }

    if (!rentVal) {
      tempErrors.monthlyRent = t('val_err_required');
    } else {
      const rentNum = Number(rentVal);
      if (isNaN(rentNum)) {
        tempErrors.monthlyRent = t('val_err_numeric_only');
      } else if (rentNum <= 0) {
        tempErrors.monthlyRent = t('val_err_numeric_positive');
      } else if (rentNum > 50000) {
        tempErrors.monthlyRent = t('val_err_max_value', { max: '50000 RM' });
      }
    }

    if (!trimmedDesc) {
      tempErrors.description = t('val_err_required');
    } else if (trimmedDesc.length > 2000) {
      tempErrors.description = t('val_err_too_long', { max: 2000 });
    }

    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors);
      if (blocker && blocker.state === 'blocked') {
        blocker.reset();
      }
      return;
    }

    setUploading(true);

    try {
      if (editingId) {
        const coverUrl = existingImages.find(img => img.id !== null)?.imageUrl || formData.imageUrl || '';
        const payload = { ...formData, imageUrl: coverUrl, monthlyRent: parseFloat(formData.monthlyRent), ownerId: currentUser.id };

        if (editingWasRejected) await resubmitProperty(editingId, payload);
        else await updateProperty(editingId, payload);

        if (imageFiles.length > 0) {
          try {
            await uploadPropertyImages(editingId, imageFiles);
          } catch (imgErr) {
            console.error('[EditProperty] Image upload failed:', imgErr);
            setIsDirty(false);
            resetForm();
            await fetchProperties();
            setUploading(false);
            setSaveError('Property saved, but new images failed to upload. Please edit the listing to try uploading again.');
            setTimeout(() => setSaveError(null), 6000);
            if (proceedAfterSave && typeof proceedAfterSave === 'function') {
              proceedAfterSave();
            }
            return;
          }
        }
      } else {
        const payload = { ...formData, imageUrl: '', monthlyRent: parseFloat(formData.monthlyRent), ownerId: currentUser.id, availabilityStatus: 'Pending' };
        const created = await createProperty(payload);

        if (imageFiles.length > 0) {
          try {
            const uploaded = await uploadPropertyImages(created.id, imageFiles);
            if (uploaded?.length > 0) {
              await updateProperty(created.id, { ...payload, id: created.id, imageUrl: uploaded[0].imageUrl }).catch(err => console.warn('[CreateProperty] Cover update failed:', err));
            }
          } catch (imgErr) {
            console.error('[CreateProperty] Image upload failed:', imgErr);
            setIsDirty(false);
            resetForm();
            await fetchProperties();
            setUploading(false);
            setSaveError('Property created, but images failed to upload. Please edit the listing to add images.');
            setTimeout(() => setSaveError(null), 6000);
            if (proceedAfterSave && typeof proceedAfterSave === 'function') {
              proceedAfterSave();
            }
            return;
          }
        }
      }

      setIsDirty(false);
      resetForm();
      await fetchProperties();
      if (proceedAfterSave && typeof proceedAfterSave === 'function') {
        proceedAfterSave();
      }
    } catch (error) {
      console.error('[handleSubmit] Failed:', error);
      setSaveError('Failed to save property. Please check your input and try again.');
      setTimeout(() => setSaveError(null), 5000);
      if (blocker && blocker.state === 'blocked') {
        blocker.reset();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProperty(deleteTarget);
      await fetchProperties();
    } catch (err) {
      console.error(err);
    }
    setDeleteTarget(null);
  };

  const resolveImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
    return url;
  };

  const approvedCount = properties.filter(p => p.approvalStatus === 'Approved').length;
  const pendingCount = properties.filter(p => p.approvalStatus === 'Pending').length;
  const rejectedCount = properties.filter(p => p.approvalStatus === 'Rejected').length;

  if (loading) return (
    <div className="rs-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: '3px' }} />
        <p className="text-on-surface-variant font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="rs-page pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* Modals */}
        <ConfirmModal
          isOpen={deleteTarget !== null}
          title={t('owner_delete_title')}
          message={t('owner_delete_msg')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />

        <UnsavedChangesModal
          isOpen={blocker.state === 'blocked'}
          onSave={() => handleSubmit(null, () => blocker.proceed())}
          onDiscard={() => {
            setIsDirty(false);
            blocker.proceed();
          }}
          onCancel={() => blocker.reset()}
        />

        {/* ── Property Details Modal ── */}
        {selectedProperty && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedProperty(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-rs-lg w-full max-w-2xl border border-gray-100 animate-scale-in"
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={selectedProperty.approvalStatus} />
                  </div>
                  <h2 className="text-lg font-bold text-on-surface font-headline truncate">{selectedProperty.title}</h2>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-on-surface transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                {selectedProperty.imageUrl ? (
                  <img src={resolveImageSrc(selectedProperty.imageUrl)} alt={selectedProperty.title} className="w-full h-52 object-cover rounded-xl border border-gray-100" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-gray-300">home</span>
                    <span className="text-xs text-gray-400">{t('owner_no_photo')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Monthly Rent</p>
                    <span className="text-2xl font-black text-primary">RM {selectedProperty.monthlyRent}</span>
                  </div>
                  <StatusBadge status={selectedProperty.approvalStatus} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: 'home_work', value: selectedProperty.propertyType },
                    { icon: 'bed', value: `${selectedProperty.roomType} Room` },
                    { icon: 'chair', value: selectedProperty.furnishedStatus },
                  ].map(item => (
                    <span key={item.value} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-on-surface-variant text-xs font-semibold rounded-lg">
                      <span className="material-symbols-outlined text-[13px]">{item.icon}</span>
                      {item.value}
                    </span>
                  ))}
                </div>

                {selectedProperty.approvalStatus === 'Rejected' && selectedProperty.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-red-500 text-base mt-0.5">error</span>
                      <div>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">{t('owner_reject_reason')}</p>
                        <p className="text-sm text-red-700">{selectedProperty.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedProperty.description && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t('owner_field_desc')}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{selectedProperty.description}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => { setSelectedProperty(null); setDeleteTarget(selectedProperty.id); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-colors border border-red-200"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  {t('common_delete')}
                </button>
                <button
                  onClick={() => { setSelectedProperty(null); startEdit(selectedProperty); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary/90 text-xs font-bold rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {selectedProperty.approvalStatus === 'Rejected' ? t('owner_edit_resubmit') : t('owner_modal_edit')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add/Edit Property Modal ── */}
        {showForm && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) resetForm(); }}
          >
            <div
              className="bg-white rounded-2xl shadow-rs-lg w-full max-w-3xl border border-gray-100 animate-scale-in"
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-on-surface font-headline">
                    {editingId ? (editingWasRejected ? t('owner_edit_resubmit') : t('owner_modal_edit')) : t('owner_modal_new')}
                  </h2>
                  {editingWasRejected && (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      {t('owner_modal_resubmit_note')}
                    </p>
                  )}
                </div>
                <button onClick={resetForm} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleSubmit} id="propertyForm" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left column */}
                  <div className="space-y-4">
                    {[
                      { label: t('owner_field_title'), name: 'title', placeholder: 'e.g. Cozy Room near UiTM' },
                      { label: t('owner_field_address'), name: 'address', placeholder: 'Street address' },
                    ].map(field => (
                      <div key={field.name}>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{field.label}</label>
                        <input name={field.name} value={formData[field.name]} onChange={handleInputChange} placeholder={field.placeholder} className="rs-input text-sm" />
                        {formErrors[field.name] && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {formErrors[field.name]}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{t('owner_field_city')}</label>
                        <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="rs-input text-sm" />
                        {formErrors.city && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {formErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{t('owner_field_state')}</label>
                        <input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="rs-input text-sm" />
                        {formErrors.state && (
                          <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {formErrors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{t('owner_field_rent')}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">RM</span>
                        <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} placeholder="e.g. 450" className="rs-input text-sm pl-10" style={{ paddingLeft: '40px' }} />
                      </div>
                      {formErrors.monthlyRent && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {formErrors.monthlyRent}
                        </p>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                        <span className="material-symbols-outlined text-[11px] align-middle mr-1">photo_library</span>
                        {t('owner_field_images')}
                      </label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        multiple
                        onChange={handleImageFileChange}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1">{t('owner_images_hint')}</p>
                    </div>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t('owner_existing_images')}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {existingImages.map((img, idx) => (
                            <div key={img.id ?? `legacy-${idx}`} className="relative group">
                              <img src={resolveImageSrc(img.imageUrl)} alt={`Image ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" onError={e => { e.target.style.display = 'none'; }} />
                              {img.id !== null && (
                                <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">
                                  <span className="material-symbols-outlined text-[11px]">close</span>
                                </button>
                              )}
                              {idx === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">{t('common_cover')}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New previews */}
                    {imagePreviews.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t('owner_new_images')}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((item, idx) => (
                            <div key={idx} className="relative group">
                              <img src={item.previewUrl} alt={`New ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                              <button type="button" onClick={() => removeNewPreview(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">
                                <span className="material-symbols-outlined text-[11px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    {[
                      { label: t('owner_field_type'), name: 'propertyType', options: ['Apartment', 'Terrace', 'Condo'] },
                      { label: t('owner_field_room'), name: 'roomType', options: ['Single', 'Master', 'Middle'] },
                      { label: t('owner_field_furnish'), name: 'furnishedStatus', options: ['Fully Furnished', 'Partially Furnished', 'Unfurnished'] },
                    ].map(field => (
                      <div key={field.name}>
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{field.label}</label>
                        <div className="relative">
                          <select name={field.name} value={formData[field.name]} onChange={handleInputChange} className="rs-select text-sm pr-8" style={{ paddingRight: '32px' }}>
                            {field.options.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">expand_more</span>
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{t('owner_field_desc')}</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the property — features, nearby amenities, house rules..."
                        rows="6"
                        className="rs-input text-sm resize-none"
                        style={{ resize: 'none' }}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50 rounded-b-2xl">
                <p className="text-xs text-on-surface-variant">{t('owner_approval_note')}</p>
                <div className="flex gap-3">
                  <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-on-surface font-semibold rounded-xl text-sm transition-colors">
                    {t('common_cancel')}
                  </button>
                  <button type="submit" form="propertyForm" disabled={uploading} className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                    {uploading ? (
                      <>
                        <span className="btn-spinner" />
                        {t('owner_modal_uploading')}
                      </>
                    ) : editingId ? (editingWasRejected ? t('owner_edit_resubmit') : t('owner_modal_update')) : t('owner_modal_submit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Dashboard Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface font-headline">{t('owner_title')}</h1>
            <p className="text-on-surface-variant text-sm mt-0.5">{t('owner_subtitle')}</p>
          </div>
          {isUitmVerified() ? (
            <button
              onClick={() => showForm ? resetForm() : setShowForm(true)}
              className="rs-btn-primary text-sm py-2.5 px-5 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">add</span>
              {t('owner_new_listing')}
            </button>
          ) : (
            <button disabled className="inline-flex items-center gap-2 bg-gray-100 text-on-surface-variant font-bold py-2.5 px-5 rounded-full cursor-not-allowed opacity-60 text-sm" title="Verify your email to add properties">
              <span className="material-symbols-outlined text-base">add</span>
              {t('owner_new_listing')}
            </button>
          )}
        </div>

        {/* ── Error Banner ── */}
        {saveError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-fade-in">
            <span className="material-symbols-outlined text-red-500">error</span>
            <span className="font-medium text-sm">{saveError}</span>
          </div>
        )}

        {/* ── Verification Warning ── */}
        {!isUitmVerified() && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
            <div>
              <span className="font-bold block text-sm">{t('owner_verify_warning')}</span>
              <span className="text-sm">{t('owner_verify_desc')}</span>
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('owner_stat_total'),    value: properties.length, color: 'text-on-surface',   bgClass: 'bg-white',        borderClass: 'border-gray-200',    icon: 'home_work',    iconBg: 'bg-gray-100',    iconColor: 'text-on-surface-variant' },
            { label: t('owner_stat_approved'), value: approvedCount,     color: 'text-emerald-600', bgClass: 'bg-emerald-50',   borderClass: 'border-emerald-200', icon: 'check_circle', iconBg: 'bg-emerald-50',  iconColor: 'text-emerald-500' },
            { label: t('owner_stat_pending'),  value: pendingCount,      color: 'text-amber-600',   bgClass: 'bg-amber-50',     borderClass: 'border-amber-200',   icon: 'schedule',     iconBg: 'bg-amber-50',    iconColor: 'text-amber-500' },
            { label: t('owner_stat_rejected'), value: rejectedCount,     color: 'text-red-500',     bgClass: 'bg-red-50',       borderClass: 'border-red-200',     icon: 'cancel',       iconBg: 'bg-red-50',      iconColor: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl border p-5 shadow-rs-sm ${stat.bgClass} ${stat.borderClass}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${stat.iconColor} text-xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Property Cards Grid ── */}
        {properties.length === 0 ? (
          <div className="rs-empty-state">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">home_work</span>
            </div>
            <h3 className="font-bold text-on-surface text-lg mb-1">{t('owner_no_listings_title')}</h3>
            <p className="text-on-surface-variant text-sm mb-5">{t('owner_no_listings_sub')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="rs-btn-primary text-sm py-2.5 px-6"
            >
              <span className="material-symbols-outlined text-base">add</span>
              {t('owner_first_listing')}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-on-surface">{t('owner_title')}</h2>
              <span className="text-sm text-on-surface-variant">{t('owner_listings_total', { count: properties.length })}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {properties.map(p => {
                const coverImg = p.images?.[0]?.imageUrl || p.imageUrl;
                const resolvedImg = coverImg ? resolveImageSrc(coverImg) : null;

                return (
                  <div key={`property-${p.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-rs-sm hover:shadow-rs-md transition-all duration-300 overflow-hidden group">
                    {/* Property Image */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {resolvedImg ? (
                        <img
                          src={resolvedImg}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
                          <span className="material-symbols-outlined text-4xl text-gray-300">home</span>
                          <span className="text-xs text-gray-400">{t('owner_no_photo')}</span>
                        </div>
                      )}

                      {/* Approval status overlay */}
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={p.approvalStatus} />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-on-surface text-sm line-clamp-1 font-headline flex-1">{p.title}</h3>
                        <span className="text-sm font-black text-primary flex-shrink-0">RM {p.monthlyRent}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {p.city}, {p.state}
                      </p>

                      {/* Property type chips */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-on-surface-variant rounded-full font-medium">{p.propertyType}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-on-surface-variant rounded-full font-medium">{p.roomType}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-on-surface-variant rounded-full font-medium">{p.furnishedStatus}</span>
                      </div>

                      {/* Rejection reason */}
                      {p.approvalStatus === 'Rejected' && p.rejectionReason && (
                        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">{t('owner_reject_reason')}</p>
                          <p className="text-xs text-red-700 line-clamp-2">{p.rejectionReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProperty(p)}
                          className="flex-1 py-2 text-xs font-bold text-on-surface-variant bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          {t('owner_view')}
                        </button>
                        <button
                          onClick={() => startEdit(p)}
                          className="flex-1 py-2 text-xs font-bold text-primary bg-primary/8 hover:bg-primary/15 rounded-xl transition-colors"
                          style={{ background: 'rgba(0,88,190,0.06)' }}
                        >
                          {p.approvalStatus === 'Rejected' ? t('owner_edit_resubmit') : t('owner_edit')}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p.id)}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                          title="Delete property"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Listing Card */}
              {isUitmVerified() && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-8 min-h-[280px] group"
                >
                  <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/15 rounded-2xl flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl">add</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{t('owner_add_listing')}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{t('owner_add_listing_sub')}</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
