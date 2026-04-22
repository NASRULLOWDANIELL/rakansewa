import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../services/api';
import { Link } from 'react-router-dom';

const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    category: 'Comment',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) {
    return (
      <div className="pt-32 pb-20 px-6 text-center text-on-surface">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">login</span>
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-on-surface-variant mb-6">You must be logged in to submit feedback.</p>
        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full font-bold">Login</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await submitFeedback({
        userId: currentUser.id,
        category: formData.category,
        subject: formData.subject,
        message: formData.message
      });
      setSuccess(true);
      setFormData({ category: 'Comment', subject: '', message: '' });
    } catch (err) {
       setError('Failed to submit feedback. Please try again.');
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-headline text-on-surface mb-2">Submit Feedback</h1>
        <p className="text-on-surface-variant">We value your input. Let us know how we can improve RakanSewa.</p>
      </div>

      <div className="glass p-8 rounded-2xl shadow-xl border border-white/40">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-[fadeIn_0.3s_ease-out]">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-medium">Thank you! Your feedback has been submitted successfully.</span>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-[fadeIn_0.3s_ease-out]">
            <span className="material-symbols-outlined">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Category</label>
              <select 
                 name="category" 
                 value={formData.category} 
                 onChange={handleChange}
                 className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
              >
                 <option>Comment</option>
                 <option>Suggestion</option>
                 <option>Report</option>
              </select>
           </div>
           
           <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Subject</label>
              <input 
                 required 
                 name="subject" 
                 value={formData.subject} 
                 onChange={handleChange} 
                 placeholder="Brief summary of your feedback" 
                 className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
              />
           </div>

           <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Message</label>
              <textarea 
                 required 
                 name="message" 
                 value={formData.message} 
                 onChange={handleChange} 
                 placeholder="Please provide details..." 
                 rows="5"
                 className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
              ></textarea>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
           >
             {loading ? 'Submitting...' : (
               <><span className="material-symbols-outlined">send</span> Submit Feedback</>
             )}
           </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
