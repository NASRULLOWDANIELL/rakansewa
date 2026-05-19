import { useEffect, useState } from 'react';
import { getPropertiesByOwner, deleteProperty, createProperty, updateProperty, resubmitProperty, uploadPropertyImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const OwnerDashboard = () => {
  const { currentUser, isUitmVerified } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingWasRejected, setEditingWasRejected] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', address: '', city: '', state: '', 
    monthlyRent: '', roomType: 'Single', propertyType: 'Apartment', 
    furnishedStatus: 'Fully Furnished', availabilityStatus: 'Pending',
    imageUrl: ''
  });

  useEffect(() => {
    if (currentUser?.id) {
      fetchProperties();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
    setImageFile(null);
    setImagePreview(property.imageUrl || '');
    setEditingId(property.id);
    setEditingWasRejected(property.approvalStatus === 'Rejected');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', address: '', city: '', state: '', 
      monthlyRent: '', roomType: 'Single', propertyType: 'Apartment', 
      furnishedStatus: 'Fully Furnished', availabilityStatus: 'Pending',
      imageUrl: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setEditingWasRejected(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let finalImageUrl = formData.imageUrl;

      // Upload image file if selected
      if (imageFile) {
        const uploadResult = await uploadPropertyImage(imageFile);
        finalImageUrl = uploadResult.imageUrl;
      }

      const payload = { 
        ...formData, 
        imageUrl: finalImageUrl,
        monthlyRent: parseFloat(formData.monthlyRent),
        ownerId: currentUser.id
      };

      if (editingId) {
        if (editingWasRejected) {
          await resubmitProperty(editingId, payload);
        } else {
          await updateProperty(editingId, payload);
        }
      } else {
        payload.availabilityStatus = 'Pending';
        await createProperty(payload);
      }
      resetForm();
      await fetchProperties();
    } catch (error) {
      console.error(error);
      setSaveError('Failed to save property. Please try again.');
      setTimeout(() => setSaveError(null), 4000);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Pending':
      default:
        return 'bg-orange-100 text-orange-700 border border-orange-200';
    }
  };

  // Resolve image src: if it starts with /uploads, prepend backend URL
  const resolveImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
    return url;
  };

  if (loading) return <div className="text-center py-32 text-on-surface">Loading properties...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone and the listing will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined">error</span>
          <span className="font-medium">{saveError}</span>
        </div>
      )}

      {/* Verification warning for owners */}
      {!isUitmVerified() && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
          <div>
            <span className="font-bold block">Verification required</span>
            <span className="text-sm">Please complete your profile verification to add and manage property listings.</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">My Properties</h1>
           <p className="text-on-surface-variant">Manage your property listings and see their approval status.</p>
        </div>
        {isUitmVerified() ? (
          <button 
            onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); } }} 
            className="bg-primary text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            {showForm ? 'Cancel' : '+ Add Property'}
          </button>
        ) : (
          <button 
            disabled
            className="bg-surface-container-high text-on-surface-variant font-bold py-3 px-6 rounded-full cursor-not-allowed opacity-60"
            title="Verify your email to add properties"
          >
            + Add Property
          </button>
        )}
      </div>

      {/* Modal overlay — fixed fullscreen */}
      {showForm && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0,
            width: '100vw', 
            height: '100vh', 
            minHeight: '100vh',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
        >
          <div 
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-3xl relative border border-white/20"
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
             <div className="p-8 pb-0 flex-shrink-0">
               <button onClick={resetForm} className="absolute top-4 right-4 w-10 h-10 bg-surface-container hover:bg-surface-container-high rounded-full flex items-center justify-center text-on-surface transition-colors z-10">
                  <span className="material-symbols-outlined">close</span>
               </button>
               <h2 className="text-2xl font-bold font-headline mb-2 text-on-surface">
                 {editingId ? (editingWasRejected ? 'Edit & Resubmit Property' : 'Edit Property') : 'List New Property'}
               </h2>
               {editingWasRejected && (
                 <p className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">info</span>
                   Saving changes will resubmit this property for admin approval.
                 </p>
               )}
             </div>

             <div className="overflow-y-auto flex-1 p-8 pt-4">
               <form onSubmit={handleSubmit} id="propertyForm" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="Property Title" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface"/>
                    <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface"/>
                    <div className="flex gap-4">
                      <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface"/>
                      <input required name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface"/>
                    </div>
                    <input type="number" required name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} placeholder="Monthly Rent (RM)" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface"/>

                    {/* Image upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                        <span className="material-symbols-outlined text-[12px] align-middle mr-1">image</span>
                        Upload Property Image
                      </label>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageFileChange}
                        className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl text-on-surface text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                      <p className="text-xs text-on-surface-variant mt-1">JPG, PNG, or WebP. Max 5MB.</p>
                    </div>

                    {/* Image URL input removed as per user request */}
                 </div>
                 <div className="space-y-4">
                    <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface">
                       <option>Apartment</option><option>Terrace</option><option>Condo</option>
                    </select>
                    <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface">
                       <option>Single</option><option>Master</option><option>Middle</option>
                    </select>
                    <select name="furnishedStatus" value={formData.furnishedStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface">
                       <option>Fully Furnished</option><option>Partially Furnished</option><option>Unfurnished</option>
                    </select>
                    <textarea required name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface"></textarea>
                 </div>
                 
                 {/* Image preview */}
                 {(imagePreview || formData.imageUrl) && (
                   <div className="md:col-span-2">
                     <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Image Preview</p>
                     <img 
                       src={imagePreview || resolveImageSrc(formData.imageUrl)} 
                       alt="Preview" 
                       className="w-48 h-32 object-cover rounded-xl border border-surface-container-high"
                       onError={(e) => { e.target.style.display = 'none'; }}
                     />
                   </div>
                 )}

                 <div className="md:col-span-2 pt-4 flex gap-4 justify-end border-t border-surface-container-low mt-4 pt-6">
                    <button type="button" onClick={resetForm} className="bg-surface-container text-on-surface font-bold py-3 px-8 rounded-full hover:bg-surface-container-high transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={uploading} className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center gap-2">
                      {uploading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                          Uploading...
                        </>
                      ) : editingId ? (editingWasRejected ? 'Resubmit for Approval' : 'Update Listing') : 'Submit for Approval'}
                    </button>
                 </div>
               </form>
             </div>
             <p className="text-xs text-on-surface-variant p-4 pt-0 text-center flex-shrink-0">* New properties require admin approval before becoming visible to students.</p>
          </div>
        </div>
      )}

      {properties.length === 0 && !showForm ? (
        <div className="text-center py-20 glass rounded-xl border border-white/40">
          <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">home_work</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No Properties Yet</h3>
          <p className="text-on-surface-variant mb-6">Start by adding your first property listing.</p>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20"
          >
            + Add Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
             <div key={`property-${p.id}`} className="glass p-6 rounded-2xl shadow-sm border border-white/40 flex flex-col justify-between">
                {/* Property image thumbnail */}
                {p.imageUrl && (
                  <div className="h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
                    <img src={resolveImageSrc(p.imageUrl)} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(p.approvalStatus)}`}>
                        {p.approvalStatus}
                      </span>
                      <span className="text-xl font-bold text-primary">RM{p.monthlyRent}</span>
                   </div>
                   <h3 className="text-xl font-bold font-headline mb-1">{p.title}</h3>
                   <p className="text-sm text-on-surface-variant flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-sm">location_on</span> {p.city}, {p.state}
                   </p>
                   <div className="flex gap-2 flex-wrap mb-4">
                      <span className="bg-surface-container-low text-xs px-2 py-1 rounded">{p.propertyType}</span>
                      <span className="bg-surface-container-low text-xs px-2 py-1 rounded">{p.roomType}</span>
                   </div>

                   {/* Rejection reason banner */}
                   {p.approvalStatus === 'Rejected' && p.rejectionReason && (
                     <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                         <span className="text-xs font-bold uppercase tracking-widest text-red-600">Rejection Reason</span>
                       </div>
                       <p className="text-sm text-red-700 leading-relaxed">{p.rejectionReason}</p>
                     </div>
                   )}
                </div>
                <div className="flex gap-2 border-t border-surface-container-low pt-4">
                   <button onClick={() => startEdit(p)} className="flex-1 text-primary bg-primary/10 py-2 rounded-lg font-bold hover:bg-primary/20 transition-colors">
                     {p.approvalStatus === 'Rejected' ? 'Edit & Resubmit' : 'Edit'}
                   </button>
                   <button onClick={() => setDeleteTarget(p.id)} className="text-error bg-error/10 px-4 py-2 rounded-lg hover:bg-error/20 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
