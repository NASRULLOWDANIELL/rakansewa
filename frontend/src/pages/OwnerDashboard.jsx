import { useEffect, useState } from 'react';
import { getProperties, deleteProperty, createProperty, updateProperty } from '../services/api';

const OwnerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', address: '', city: '', state: '', 
    monthlyRent: '', roomType: 'Single', propertyType: 'Apartment', 
    furnishedStatus: 'Fully Furnished', availabilityStatus: 'Pending'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (property) => {
    setFormData(property);
    setEditingId(property.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', address: '', city: '', state: '', 
      monthlyRent: '', roomType: 'Single', propertyType: 'Apartment', 
      furnishedStatus: 'Fully Furnished', availabilityStatus: 'Pending'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, monthlyRent: parseFloat(formData.monthlyRent) };
      // Force status to "Pending" on create or update
      payload.availabilityStatus = 'Pending';

      if (editingId) {
        await updateProperty(editingId, payload);
      } else {
        await createProperty(payload);
      }
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error(error);
      alert('Error saving property');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(id);
        fetchProperties();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-center py-32 text-on-surface">Loading properties...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">My Properties</h1>
           <p className="text-on-surface-variant">Manage your property listings and see their approval status.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-primary text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          {showForm ? 'Cancel' : '+ Add Property'}
        </button>
      </div>

      {showForm && (
        <div className="glass p-8 rounded-2xl shadow-xl border border-white/40 mb-12">
           <h2 className="text-2xl font-bold font-headline mb-6">{editingId ? 'Edit Property' : 'List New Property'}</h2>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="Property Title" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl"/>
                <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl"/>
                <div className="flex gap-4">
                  <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl"/>
                  <input required name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl"/>
                </div>
                <input type="number" required name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} placeholder="Monthly Rent (RM)" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl"/>
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
                <textarea required name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl"></textarea>
             </div>
             
             <div className="md:col-span-2 pt-4">
                <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  {editingId ? 'Update Listing' : 'Submit for Approval'}
                </button>
             </div>
           </form>
           <p className="text-xs text-on-surface-variant mt-4">* New properties require admin approval before becoming visible to students.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(p => (
           <div key={p.id} className="glass p-6 rounded-2xl shadow-sm border border-white/40 flex flex-col justify-between">
              <div>
                 <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.availabilityStatus === 'Pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : p.availabilityStatus === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.availabilityStatus}
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
              </div>
              <div className="flex gap-2 border-t border-surface-container-low pt-4">
                 <button onClick={() => startEdit(p)} className="flex-1 text-primary bg-primary/10 py-2 rounded-lg font-bold hover:bg-primary/20 transition-colors">Edit</button>
                 <button onClick={() => handleDelete(p.id)} className="text-error bg-error/10 px-4 py-2 rounded-lg hover:bg-error/20 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
