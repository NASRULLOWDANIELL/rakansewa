import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../services/api';
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
    } catch (err) {
      setError(t('fb_error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8 pb-4 border-b border-outline-variant/20">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">{t('fb_title')}</h1>
        <p className="text-on-surface-variant text-sm mt-1">{t('fb_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left info panel */}
        <div className="space-y-6">
          <div className="bg-white border border-outline-variant/20 rounded-xl p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              {t('fb_why_title')}
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('fb_why_desc')}
            </p>
          </div>

          <div className="bg-white border border-outline-variant/20 rounded-xl p-6">
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

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <p className="text-sm font-bold text-primary">{t('fb_logged_in_as')}</p>
            </div>
            <p className="text-sm text-on-surface font-medium">{currentUser.name}</p>
            <p className="text-xs text-on-surface-variant">{currentUser.email}</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-outline-variant/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-6">{t('fb_form_title')}</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-medium text-sm">{t('fb_success')}</span>
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
                <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1.5">{t('fb_label_category')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm animate-fade-in"
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
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
                {formErrors.subject && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
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
                  rows="6"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                ></textarea>
                {formErrors.message && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium animate-fade-in flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {formErrors.message}
                  </p>
                )}
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
                      {t('fb_btn_submitting')}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      {t('fb_btn_submit')}
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
