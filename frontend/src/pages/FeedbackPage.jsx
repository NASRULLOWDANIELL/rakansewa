import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback, getAllFeedbacks, getAllUsers } from '../services/api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    category: 'Comment',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const formRef = useRef(null);

  const fetchFeedbackData = async () => {
    try {
      const [fdks, usrs] = await Promise.all([
        getAllFeedbacks(),
        getAllUsers()
      ]);
      setFeedbacks(fdks || []);
      setUsers(usrs || []);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFeedbackData();
    }
  }, [currentUser]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  if (!currentUser) {
    return (
      <div className="pt-32 pb-20 px-6 text-center text-on-surface">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">login</span>
        <h2 className="text-2xl font-bold mb-4">{t('fb_not_logged_title')}</h2>
        <p className="text-on-surface-variant mb-6">{t('fb_not_logged_desc')}</p>
        <Link to="/login" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">{t('fb_not_logged_btn')}</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setError('');
    setSuccess(false);

    const tempErrors = {};
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedSubject) {
      tempErrors.subject = t('val_err_required');
    } else if (trimmedSubject.length > 100) {
      tempErrors.subject = t('val_err_too_long', { max: 100 });
    }

    if (!trimmedMessage) {
      tempErrors.message = t('val_err_required');
    } else if (trimmedMessage.length > 1000) {
      tempErrors.message = t('val_err_too_long', { max: 1000 });
    }

    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors);
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        userId: currentUser.id,
        category: formData.category,
        subject: trimmedSubject,
        message: trimmedMessage
      });
      setSuccess(true);
      setFormData({ category: 'Comment', subject: '', message: '' });
      fetchFeedbackData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(t('fb_error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const myFeedbacks = feedbacks.filter(f => f.userId === currentUser.id);

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 lg:px-16 w-full mx-auto">
      {/* Page header */}
      <div className="mb-8 pb-4 border-b border-outline-variant/20">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">{t('fb_title')}</h1>
        <p className="text-on-surface-variant text-sm mt-1">{t('fb_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Info & User Panels */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold font-headline text-on-surface mt-0 pt-0 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            {t('fb_guide_title')}
          </h2>

          {/* Why Feedback Matters */}
          <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              {t('fb_why_title')}
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('fb_why_desc')}
            </p>
          </div>

          {/* Feedback Categories */}
          <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">category</span>
              {t('fb_categories_title')}
            </h2>
            <ul className="space-y-3">
              {[
                { icon: 'chat', label: t('fb_cat_comment'), desc: t('fb_cat_comment_desc') },
                { icon: 'lightbulb', label: t('fb_cat_suggestion'), desc: t('fb_cat_suggestion_desc') },
                { icon: 'flag', label: t('fb_cat_report'), desc: t('fb_cat_report_desc') },
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

          {/* Ready to Share Feedback? CTA Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm hover-glow-blue transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">rate_review</span>
              <p className="text-sm font-bold text-primary">Ready to Share Feedback?</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Help other students by sharing your house reviews and experiences on RakanSewa.
            </p>
            <div className="text-[10px] text-on-surface-variant font-medium mb-3 border-t border-outline-variant/15 pt-2">
              Logged in as: <span className="font-bold text-on-surface">{currentUser.name}</span>
            </div>
            <button
              onClick={() => {
                setSuccess(false);
                setError('');
                setFormErrors({});
                setIsModalOpen(true);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-rs-blue"
            >
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              Write Feedback
            </button>
          </div>
        </div>

        {/* Right Column - Community Feed & Your Feedback Form */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-extrabold font-headline text-on-surface mt-0 pt-0 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">forum</span>
            Community Feedback
          </h2>

          {/* Feedback Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-4 shadow-sm text-center transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-emerald cursor-default">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{feedbacks.length}</span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Total Feedback</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-4 shadow-sm text-center transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-blue cursor-default">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {feedbacks.filter(f => f.category === 'Comment').length}
                </span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Comments</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-4 shadow-sm text-center transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-purple cursor-default">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {feedbacks.filter(f => f.category === 'Suggestion').length}
                </span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Suggestions</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-4 shadow-sm text-center transition-all duration-300 hover:shadow-rs-lg hover:-translate-y-1 hover-glow-red cursor-default">
                <span className="text-2xl font-black text-red-500">
                  {feedbacks.filter(f => f.category === 'Report').length}
                </span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Reports</p>
              </div>
            </div>

            {/* Filtering pills */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant/10 pb-4">
              {['All', 'Comment', 'Suggestion', 'Report'].map((type) => {
                const isActive = selectedCategoryFilter === type;
                const label = type === 'All' ? 'All Feedbacks' : (type + 's');
                const badgeColor = type === 'Comment' ? 'hover:text-blue-500' : type === 'Suggestion' ? 'hover:text-purple-500' : type === 'Report' ? 'hover:text-red-500' : 'hover:text-primary';
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedCategoryFilter(type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-white shadow-rs-blue'
                        : `bg-surface-container hover:bg-surface-container-high text-on-surface-variant ${badgeColor}`
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {(() => {
              const filteredFeedbacks = selectedCategoryFilter === 'All'
                ? feedbacks
                : feedbacks.filter(f => f.category === selectedCategoryFilter);

              if (filteredFeedbacks.length === 0) {
                return (
                  <div className="text-center py-16 bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">forum</span>
                    <p className="text-on-surface-variant text-sm">No feedback found for this category.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredFeedbacks.map((f) => {
                    const writer = users.find(u => u.id === f.userId);
                    const writerName = writer ? writer.name : 'Anonymous Student';
                    const writerRole = writer ? writer.role : 'Student';
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFeedback(f)}
                        className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-4 shadow-sm hover:shadow-rs-lg hover:-translate-y-1 flex flex-col justify-between transition-all duration-300 cursor-pointer group"
                      >
                        <div className="mb-4">
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              f.category === 'Comment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              f.category === 'Suggestion' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {f.category}
                            </span>
                            <span className="text-[9px] text-on-surface-variant font-medium">
                              {new Date(f.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-on-surface text-sm mb-1 font-headline truncate">{f.subject}</h3>
                          <p className="text-on-surface-variant text-[11px] leading-relaxed line-clamp-3">{f.message}</p>
                        </div>

                        <div className="pt-2.5 border-t border-outline-variant/10 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] flex-shrink-0">
                            {writerName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-on-surface truncate">{writerName}</p>
                            <p className="text-[8px] text-on-surface-variant uppercase tracking-wider font-semibold">{writerRole}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          {/* My Feedback History Section */}
          <div className="bg-white dark:bg-slate-800 border border-outline-variant/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              My Feedback History
              <span className="text-xs font-normal text-on-surface-variant bg-surface-container rounded-full px-2.5 py-0.5 ml-1">
                {myFeedbacks.length}
              </span>
            </h2>

            {myFeedbacks.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic text-center py-6">You haven't submitted any feedback yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px] md:min-w-0">
                  <thead className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {myFeedbacks.map((f) => {
                      const statusText = f.isResolved
                        ? (f.category === 'Comment' ? 'Reviewed' : 'Implemented')
                        : 'Pending';
                      const statusColor = statusText === 'Pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
                      return (
                        <tr key={f.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              f.category === 'Comment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              f.category === 'Suggestion' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {f.category}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-on-surface">{f.subject}</td>
                          <td className="px-4 py-3.5 text-on-surface-variant">
                            {new Date(f.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Centered Feedback Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-rs-lg w-full md:w-[75vw] max-w-6xl border border-outline-variant/20 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rate_review</span>
                Submit Feedback
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-surface-container hover:bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-medium text-sm">{t('fb_success')}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                  <span className="material-symbols-outlined">error</span>
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">{t('fb_label_category')}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  >
                    <option value="Comment">{t('fb_cat_comment')}</option>
                    <option value="Suggestion">{t('fb_cat_suggestion')}</option>
                    <option value="Report">{t('fb_cat_report')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">{t('fb_label_subject')}</label>
                  <input
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t('fb_placeholder_subject')}
                    className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                  {formErrors.subject && (
                    <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {formErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">{t('fb_label_message')}</label>
                  <textarea
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('fb_placeholder_message')}
                    rows="12"
                    className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-y"
                  ></textarea>
                  {formErrors.message && (
                    <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {formErrors.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-lg border border-outline-variant/30 text-on-surface text-xs font-bold hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-xs shadow-sm"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                        {t('fb_btn_submitting')}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">send</span>
                        {t('fb_btn_submit')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Selected Feedback Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-rs-lg w-full max-w-xl border border-outline-variant/20 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  selectedFeedback.category === 'Comment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  selectedFeedback.category === 'Suggestion' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {selectedFeedback.category}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {new Date(selectedFeedback.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-8 h-8 bg-surface-container hover:bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface font-headline leading-tight">
                  {selectedFeedback.subject}
                </h3>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 text-sm text-on-surface leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {selectedFeedback.message}
              </div>

              {/* Writer Details */}
              {(() => {
                const writer = users.find(u => u.id === selectedFeedback.userId);
                const writerName = writer ? writer.name : 'Anonymous Student';
                const writerRole = writer ? writer.role : 'Student';
                return (
                  <div className="pt-4 border-t border-outline-variant/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                      {writerName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface leading-tight">{writerName}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mt-0.5">{writerRole}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-rs-blue"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
