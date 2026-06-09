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

  const resolveImageSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) return `http://localhost:8080${url}`;
    return url;
  };

  if (loading) return <div className="text-center py-32 text-on-surface">Loading properties...</div>;

  const approvedCount = properties.filter(p => p.approvalStatus === 'Approved').length;
  const pendingCount = properties.filter(p => p.approvalStatus === 'Pending').length;
  const rejectedCount = properties.filter(p => p.approvalStatus === 'Rejected').length;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-8">
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone and the listing will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Add/Edit Property Modal */}
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
            className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl relative border border-outline-variant/20"
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold font-headline text-on-surface">
                  {editingId ? (editingWasRejected ? 'Edit & Resubmit Property' : 'Edit Property') : 'List New Property'}
                </h2>
                {editingWasRejected && (
                  <p className="text-sm text-orange-600 mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Saving will resubmit this property for admin approval.
                  </p>
                )}
              </div>
              <button
                onClick={resetForm}
                className="w-9 h-9 bg-surface-container hover:bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-8">
              <form onSubmit={handleSubmit} id="propertyForm" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Property Title</label>
                    <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Cozy Room near UiTM" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Address</label>
                    <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Street address" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">City</label>
                      <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">State</label>
                      <input required name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Monthly Rent (RM)</label>
                    <input type="number" required name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} placeholder="e.g. 450" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  {/* Image upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-1">image</span>
                      Property Image
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageFileChange}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">JPG, PNG, or WebP. Max 5MB.</p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Property Type</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                      <option>Apartment</option><option>Terrace</option><option>Condo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Room Type</label>
                    <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                      <option>Single</option><option>Master</option><option>Middle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Furnished Status</label>
                    <select name="furnishedStatus" value={formData.furnishedStatus} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                      <option>Fully Furnished</option><option>Partially Furnished</option><option>Unfurnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Description</label>
                    <textarea required name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the property..." rows="4" className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"></textarea>
                  </div>
                  {/* Image preview */}
                  {(imagePreview || formData.imageUrl) && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Preview</p>
                      <img
                        src={imagePreview || resolveImageSrc(formData.imageUrl)}
                        alt="Preview"
                        className="w-full h-28 object-cover rounded-lg border border-outline-variant/20"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="px-8 py-5 border-t border-outline-variant/20 flex items-center justify-between flex-shrink-0 bg-surface-container-lowest">
              <p className="text-xs text-on-surface-variant">* New properties require admin approval before going live.</p>
              <div className="flex gap-3">
                <button type="button" onClick={resetForm} className="bg-surface-container text-on-surface font-bold py-2.5 px-6 rounded-lg hover:bg-surface-container-high transition-colors text-sm border border-outline-variant/20">
                  Cancel
                </button>
                <button type="submit" form="propertyForm" disabled={uploading} className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 text-sm">
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Uploading...
                    </>
                  ) : editingId ? (editingWasRejected ? 'Resubmit for Approval' : 'Update Listing') : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">My Properties</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage your property listings and monitor approval status.</p>
        </div>
        {isUitmVerified() ? (
          <button
            onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); } }}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Property
          </button>
        ) : (
          <button
            disabled
            className="inline-flex items-center gap-2 bg-surface-container-high text-on-surface-variant font-bold py-2.5 px-5 rounded-lg cursor-not-allowed opacity-60 text-sm"
            title="Verify your email to add properties"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Property
          </button>
        )}
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
          <span className="material-symbols-outlined">error</span>
          <span className="font-medium text-sm">{saveError}</span>
        </div>
      )}

      {!isUitmVerified() && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
          <div>
            <span className="font-bold block text-sm">Verification Required</span>
            <span className="text-sm">Complete your profile verification to add and manage property listings.</span>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-outline-variant/20 rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Listings</p>
          <p className="text-3xl font-extrabold text-on-surface">{properties.length}</p>
        </div>
        <div className="bg-white border border-outline-variant/20 rounded-lg p-5 border-l-4 border-l-green-500">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Approved</p>
          <p className="text-3xl font-extrabold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white border border-outline-variant/20 rounded-lg p-5 border-l-4 border-l-orange-400">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Pending</p>
          <p className="text-3xl font-extrabold text-orange-500">{pendingCount}</p>
        </div>
        <div className="bg-white border border-outline-variant/20 rounded-lg p-5 border-l-4 border-l-red-400">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Rejected</p>
          <p className="text-3xl font-extrabold text-red-500">{rejectedCount}</p>
        </div>
      </div>

      {/* Properties table / empty state */}
      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">home_work</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No Properties Yet</h3>
          <p className="text-on-surface-variant mb-6 text-sm">Start by adding your first property listing.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Property
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/20">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Property</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">Location</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden lg:table-cell">Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Rent</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {properties.map(p => (
                <tr key={`property-${p.id}`} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img
                          src={resolveImageSrc(p.imageUrl)}
                          alt={p.title}
                          className="w-12 h-12 object-cover rounded-lg border border-outline-variant/20 flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-on-surface-variant/40">home</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface truncate max-w-[180px]">{p.title}</p>
                        {p.approvalStatus === 'Rejected' && p.rejectionReason && (
                          <p className="text-xs text-red-600 truncate max-w-[180px] mt-0.5">
                            <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">error</span>
                            {p.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {p.city}, {p.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded">{p.propertyType}</span>
                      <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded">{p.roomType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">RM {p.monthlyRent}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(p.approvalStatus)}`}>
                      {p.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors text-xs whitespace-nowrap"
                      >
                        {p.approvalStatus === 'Rejected' ? 'Edit & Resubmit' : 'Edit'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p.id)}
                        className="text-error bg-error/10 p-1.5 rounded-lg hover:bg-error/20 transition-colors"
                        title="Delete property"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
