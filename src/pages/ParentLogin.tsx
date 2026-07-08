import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Lock } from 'lucide-react';
import { db } from '../lib/db';
import { Participant } from '../types';

export default function ParentLogin() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const { forceLoginAs } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    db.getParticipants().then(setParticipants);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedId) {
      setError('Please select your child.');
      return;
    }
    const success = await forceLoginAs(parseInt(selectedId));
    if (success) {
      navigate('/parent-dashboard');
    } else {
      setError('Could not login. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">👪</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Parent Access</h2>
          <p className="text-blue-100 mt-2">Manage your child's profile</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Child:</label>
            <select 
              className="w-full border rounded px-3 py-3"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              <option value="">-- Choose --</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} (ID: {p.id})</option>
              ))}
            </select>
          </div>
          
          {error && <div className="text-red-500 text-sm mb-6 text-center">{error}</div>}
          
          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
