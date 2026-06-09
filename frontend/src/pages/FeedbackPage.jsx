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
        <Link to="/login" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">Login</Link>
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
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8 pb-4 border-b border-outline-variant/20">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Submit Feedback</h1>
        <p className="text-on-surface-variant text-sm mt-1">Help us improve RakanSewa by sharing your thoughts, suggestions, or reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left info panel */}
        <div className="space-y-6">
          <div className="bg-white border border-outline-variant/20 rounded-xl p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Why Feedback Matters
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your feedback directly shapes the development of RakanSewa. Every suggestion and report is reviewed by the admin team and considered for future improvements.
            </p>
          </div>

          <div className="bg-white border border-outline-variant/20 rounded-xl p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">category</span>
              Feedback Categories
            </h2>
            <ul className="space-y-3">
              {[
                { icon: 'chat', label: 'Comment', desc: 'General thoughts or observations about the platform.' },
                { icon: 'lightbulb', label: 'Suggestion', desc: 'Ideas for new features or improvements.' },
                { icon: 'flag', label: 'Report', desc: 'Report a bug, issue, or policy violation.' },
              ].map(item => (
                <li key={item.label} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-[18px] mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <p className="text-sm font-bold text-primary">Logged in as</p>
            </div>
            <p className="text-sm text-on-surface font-medium">{currentUser.name}</p>
            <p className="text-xs text-on-surface-variant">{currentUser.email}</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-outline-variant/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-6">Your Feedback</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-medium text-sm">Thank you! Your feedback has been submitted successfully.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                <span className="material-symbols-outlined">error</span>
                <span className="font-medium text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                >
                  <option>Comment</option>
                  <option>Suggestion</option>
                  <option>Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Subject</label>
                <input
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">Message</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide details..."
                  rows="6"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-8 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-sm"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
