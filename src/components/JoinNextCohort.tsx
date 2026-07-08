import React, { useState } from 'react';
import { db } from '../lib/db';

export default function JoinNextCohort() {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestForm, setInterestForm] = useState({
    parent_name: '', child_name: '', child_age: '', location: '', phone_whatsapp: '', email: '', supporting_organization: ''
  });
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInterest(true);
    setMessage('');
    try {
      await db.saveCohortInterest({
        ...interestForm,
        child_age: parseInt(interestForm.child_age) || 0
      });
      setMessage('Thank you! Your interest has been registered. We will contact you soon.');
      setShowInterestForm(false);
      setInterestForm({ parent_name: '', child_name: '', child_age: '', location: '', phone_whatsapp: '', email: '', supporting_organization: '' });
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    }
    setSubmittingInterest(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 sm:p-8 mt-12 text-center max-w-3xl mx-auto mb-16">
      <div className="text-3xl mb-3">🌟</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Want to be featured like these innovators?</h3>
      <p className="text-gray-600 mb-6">Join the 2026 Delta SDG Summer Camp cohort and showcase your creations!</p>
      
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg font-medium">
          {message}
        </div>
      )}
      
      {!showInterestForm ? (
        <button 
          className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200" 
          onClick={() => setShowInterestForm(true)}
        >
          Join the Next Cohort
        </button>
      ) : (
        <form className="bg-white p-6 rounded-lg shadow-sm text-left grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-200" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
            <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={interestForm.parent_name} onChange={e => setInterestForm({...interestForm, parent_name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
            <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={interestForm.child_name} onChange={e => setInterestForm({...interestForm, child_name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Age</label>
            <input required type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={interestForm.child_age} onChange={e => setInterestForm({...interestForm, child_age: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={interestForm.location} onChange={e => setInterestForm({...interestForm, location: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
            <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={interestForm.phone_whatsapp} onChange={e => setInterestForm({...interestForm, phone_whatsapp: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={interestForm.email} onChange={e => setInterestForm({...interestForm, email: e.target.value})} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Is your child supported by a foundation, school, or community? (Optional)</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. STEM School XYZ, Future Leaders NGO" value={interestForm.supporting_organization} onChange={e => setInterestForm({...interestForm, supporting_organization: e.target.value})} />
          </div>
          <div className="sm:col-span-2 pt-2 flex gap-3 justify-end">
            <button type="button" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setShowInterestForm(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submittingInterest} className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
              {submittingInterest ? 'Submitting...' : 'Register Interest'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
