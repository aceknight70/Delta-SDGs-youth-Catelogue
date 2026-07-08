import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { Participant, Creation, CATEGORIES, STORY_TYPES, Branding } from '../types';
import { useAppContext } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';

export default function StaffRoom() {
  const [activeTab, setActiveTab] = useState('Applications');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { branding, refreshBranding } = useAppContext();

  useEffect(() => {
    const load = async () => {
      const p = await db.getParticipants();
      console.log("Fetched participants:", p.length, p); setParticipants(p);
    };
    load();
  }, [activeTab]); // reload when switching tabs

  const tabs = ['Applications', 'Connection Requests', 'Create Participant', 'Creations Manager', 'Stories Manager', 'PIN Management', 'Photo Allowance', 'Branding Settings'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-xl p-6 text-white mb-8 flex items-center gap-3 shadow-md">
        <span className="text-2xl">⚙️</span>
        <h1 className="text-2xl font-bold">STAFF CONTROLS — Youth Catalogue</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-lg">
        {tabs.map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[500px]">
        {activeTab === 'Applications' && <ApplicationsTab participants={participants} setParticipants={setParticipants} />}
        {activeTab === 'Connection Requests' && <ConnectionRequestsTab participants={participants} />}
        {activeTab === 'Create Participant' && <CreateParticipantTab setParticipants={setParticipants} />}
        {activeTab === 'Creations Manager' && <CreationsManagerTab participants={participants} />}
        {activeTab === 'Stories Manager' && <StoriesManagerTab participants={participants} />}
        {activeTab === 'PIN Management' && <PinManagementTab participants={participants} setParticipants={setParticipants} />}
        {activeTab === 'Photo Allowance' && <PhotoAllowanceTab participants={participants} setParticipants={setParticipants} />}
        {activeTab === 'Branding Settings' && <BrandingSettingsTab branding={branding} refreshBranding={refreshBranding} />}
      </div>
    </div>
  );
}

function ConnectionRequestsTab({ participants }: { participants: Participant[] }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const data = await db.getConnectionRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await db.updateConnectionRequestStatus(id, status);
      await loadRequests();
    } catch (err) {
      alert('Error updating status');
    }
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Connection Requests</h2>
      <p className="text-gray-600 mb-6 max-w-3xl">
        Review connection requests from visitors who want to follow up with a family. 
        Staff should reach out to the family (e.g. via WhatsApp) to ask if they are comfortable connecting. 
        Only mark as "Forwarded" once the family has agreed.
      </p>
      
      <div className="space-y-4">
        {requests.map(r => {
          const p = participants.find(p => p.id === r.participant_id);
          return (
            <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{r.requester_name}</h3>
                  <div className="text-sm text-gray-600 mb-2">Contact: {r.requester_contact}</div>
                  <div className="bg-white p-3 border border-gray-100 rounded text-gray-700 italic text-sm mb-3">
                    "{r.message || 'No message provided.'}"
                  </div>
                  <div className="text-sm">
                    <strong>Target Family:</strong> {p ? `${p.first_name} (ID: ${p.id})` : `Unknown Participant (ID: ${r.participant_id})`}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <div className="text-sm font-medium text-gray-500 mb-1">Status: <span className="text-gray-900">{r.status}</span></div>
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(r.id, 'Forwarded')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded text-sm font-bold transition-colors">
                        Mark Forwarded
                      </button>
                      <button onClick={() => handleUpdateStatus(r.id, 'Declined')} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded text-sm font-bold transition-colors">
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {requests.length === 0 && <div className="text-center py-8 text-gray-500">No connection requests found.</div>}
      </div>
    </div>
  );
}

// --- TABS ---

function ApplicationsTab({ participants, setParticipants }: any) {
  const { forceLoginAs } = useAppContext();
  const navigate = useNavigate();

  const handleUpdate = async (p: Participant, status: any) => {
    const updated = { ...p, application_status: status };
    await db.saveParticipant(updated);
    const all = await db.getParticipants();
    setParticipants(all);
    alert('Status updated!');
  };

  const handleConsentToggle = async (p: Participant) => {
    const updated = { ...p, guardian_consent: !p.guardian_consent };
    await db.saveParticipant(updated);
    const all = await db.getParticipants();
    setParticipants(all);
  };
  
  const handlePreview = async (p: Participant) => {
    const success = await forceLoginAs(p.id);
    if (success) {
      navigate('/parent-dashboard');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Participants List</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 px-4 font-bold text-gray-700">Child Name</th>
              <th className="py-3 px-4 font-bold text-gray-700">Status</th>
              <th className="py-3 px-4 font-bold text-gray-700">Consent</th>
              <th className="py-3 px-4 font-bold text-gray-700">PIN</th>
              <th className="py-3 px-4 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p: Participant) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{p.first_name}</div>
                  <div className="text-xs text-gray-500">ID: {p.id}</div>
                </td>
                <td className="py-3 px-4">
                  <select 
                    value={p.application_status} 
                    onChange={(e) => handleUpdate(p, e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={p.guardian_consent} onChange={() => handleConsentToggle(p)} className="rounded" />
                  </label>
                </td>
                <td className="py-3 px-4 font-mono text-sm tracking-widest">{p.participant_access_pin}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button onClick={() => handlePreview(p)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm font-medium">Preview as Parent</button>
                </td>
              </tr>
            ))}
            {participants.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No participants found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3 text-yellow-800 text-sm">
        <span className="text-xl">💡</span>
        <div>
          <strong className="block mb-1">Important note about Guardian Consent</strong>
          Do not set guardian_consent to TRUE unless permission has been genuinely confirmed.
        </div>
      </div>
    </div>
  );
}

import { uploadImage } from '../lib/upload';

function CreateParticipantTab({ setParticipants }: any) {
  const [formData, setFormData] = useState<Partial<Participant>>({
    first_name: '', age: 10, location_area: '', attendance_type: 'Physical', application_status: 'Approved',
    guardian_consent: false, story: '', parent_quote: '', parent_photo_url: '', participant_photo_url: '',
    participant_access_pin: '', creation_photo_limit: 10, bonus_creation_photo_slots: 0
  });
  
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // synchronous form values
    const data = { ...formData };
    const file = fileRef.current?.files?.[0];
    
    setUploading(true);
    try {
      if (file) {
        const url = await uploadImage(file);
        data.participant_photo_url = url;
      }
      
      const saved = await db.saveParticipant(data as Participant);
      alert(`Participant created! Their unique PIN is: ${saved?.participant_access_pin}`);
      const all = await db.getParticipants();
      setParticipants(all);
      // Reset form
      setFormData({
        first_name: '', age: 10, location_area: '', attendance_type: 'Physical', application_status: 'Approved',
        guardian_consent: false, story: '', parent_quote: '', parent_photo_url: '', participant_photo_url: '',
        participant_access_pin: '', creation_photo_limit: 10, bonus_creation_photo_slots: 0
      });
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      alert('Error creating participant');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Create New Participant</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input required type="text" className="w-full border rounded px-3 py-2" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input required type="number" className="w-full border rounded px-3 py-2" value={formData.age || ''} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input required type="text" className="w-full border rounded px-3 py-2" value={formData.location_area} onChange={e => setFormData({...formData, location_area: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Attendance Type</label>
          <select className="w-full border rounded px-3 py-2" value={formData.attendance_type} onChange={e => setFormData({...formData, attendance_type: e.target.value as any})}>
            <option value="Physical">Physical</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border rounded px-3 py-2" value={formData.application_status} onChange={e => setFormData({...formData, application_status: e.target.value as any})}>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Participant Photo (Physical Only)</label>
          <input type="file" accept="image/*" ref={fileRef} className="w-full border rounded px-3 py-2 bg-white text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Supported By (Optional)</label>
          <input type="text" placeholder="e.g. Foundation XYZ" className="w-full border rounded px-3 py-2" value={formData.supported_by || ''} onChange={e => setFormData({...formData, supported_by: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SDG Goal Focus (Optional)</label>
          <input type="text" placeholder="e.g. Climate Action" className="w-full border rounded px-3 py-2" value={formData.sdg_goal_focus || ''} onChange={e => setFormData({...formData, sdg_goal_focus: e.target.value})} />
        </div>

        <div className="flex items-center pt-6 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer bg-yellow-50 p-3 rounded border border-yellow-200 w-full">
            <input type="checkbox" className="rounded w-5 h-5" checked={formData.guardian_consent} onChange={e => setFormData({...formData, guardian_consent: e.target.checked})} />
            <span className="text-sm font-medium text-yellow-900">Guardian Consent Confirmed (REQUIRED before making public)</span>
          </label>
        </div>
        
        <div className="sm:col-span-2 mt-4">
          <label className="block text-sm font-medium mb-1">Story</label>
          <textarea className="w-full border rounded px-3 py-2 h-24" value={formData.story || ''} onChange={e => setFormData({...formData, story: e.target.value})} />
        </div>
      </div>
      
      <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
        {uploading ? 'Creating...' : 'Create Participant'}
      </button>
    </form>
  );
}

function PinManagementTab({ participants, setParticipants }: any) {
  const [selectedId, setSelectedId] = useState('');
  const [newPin, setNewPin] = useState('');

  const selected = participants.find((p: any) => p.id.toString() === selectedId);

  const handleUpdate = async () => {
    if (selected && newPin) {
      const updated = { ...selected, participant_access_pin: newPin };
      await db.saveParticipant(updated);
      alert('PIN updated!');
      const all = await db.getParticipants();
      setParticipants(all);
      setNewPin('');
    }
  };

  const handleRegenerate = () => {
    setNewPin(Math.floor(1000 + Math.random() * 9000).toString());
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold mb-6">PIN Management</h2>
      <select className="w-full border rounded px-3 py-2 mb-6" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">Select Participant</option>
        {participants.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} (ID: {p.id})</option>)}
      </select>

      {selected && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="mb-4">Current PIN: <span className="font-mono bg-white border px-2 py-1 rounded tracking-widest">{selected.participant_access_pin}</span></p>
          <div className="flex gap-2 mb-4">
            <input type="text" className="flex-1 border rounded px-3 py-2 font-mono tracking-widest" placeholder="New PIN" value={newPin} onChange={e => setNewPin(e.target.value)} />
            <button onClick={handleRegenerate} className="bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm hover:bg-gray-300">Random</button>
          </div>
          <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 font-medium">Reset PIN</button>
        </div>
      )}
    </div>
  );
}

function PhotoAllowanceTab({ participants, setParticipants }: any) {
  const [selectedId, setSelectedId] = useState('');
  const [limit, setLimit] = useState(10);
  const [bonus, setBonus] = useState(0);

  const selected = participants.find((p: any) => p.id.toString() === selectedId);

  useEffect(() => {
    if (selected) {
      setLimit(selected.creation_photo_limit);
      setBonus(selected.bonus_creation_photo_slots);
    }
  }, [selectedId, selected]);

  const handleUpdate = async () => {
    if (selected) {
      const updated = { ...selected, creation_photo_limit: limit, bonus_creation_photo_slots: bonus };
      await db.saveParticipant(updated);
      alert('Allowances updated!');
      const all = await db.getParticipants();
      setParticipants(all);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold mb-6">Photo Allowance</h2>
      <select className="w-full border rounded px-3 py-2 mb-6" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">Select Participant</option>
        {participants.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} (ID: {p.id})</option>)}
      </select>

      {selected && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Photo Limit</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={limit} onChange={e => setLimit(parseInt(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Extra Photo Slots</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={bonus} onChange={e => setBonus(parseInt(e.target.value))} />
          </div>
          <div className="pt-2 text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
            Current total allowance: <strong>{limit + bonus}</strong> photos
          </div>
          <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 font-medium">Save Allowances</button>
        </div>
      )}
    </div>
  );
}

function BrandingSettingsTab({ branding, refreshBranding }: any) {
  const [logoUrl, setLogoUrl] = useState(branding?.logo_url || '');
  const [mainTitle, setMainTitle] = useState(branding?.main_title || '');
  const [subtitle, setSubtitle] = useState(branding?.subtitle || '');
  const [tagline, setTagline] = useState(branding?.tagline || '');
  const [founderNote, setFounderNote] = useState(branding?.founder_note || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.updateBranding({ logo_url: logoUrl, main_title: mainTitle, subtitle, tagline, founder_note: founderNote });
    await refreshBranding();
    alert('Branding updated successfully!');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">🎨 Branding Settings</h2>
      
      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Upload Logo</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Logo URL (PNG, JPG, WebP)</label>
            <input 
              type="text" 
              className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="https://example.com/logo.png"
              value={logoUrl} 
              onChange={e => setLogoUrl(e.target.value)} 
            />
            <p className="text-xs text-gray-500 mt-1">Provide a URL for the logo. Clear it to use the default 🌟 placeholder.</p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Current Logo Preview:</p>
            <div className="bg-white border rounded p-4 inline-block shadow-sm">
              {logoUrl ? (
                <img src={logoUrl} alt="Preview" className="h-[60px] w-auto object-contain" />
              ) : (
                <div className="w-[60px] h-[60px] bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-400">🌟</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <h3 className="font-bold text-gray-900 mb-2">Branding Text</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Main Title</label>
            <input required type="text" className="w-full border rounded px-3 py-2" value={mainTitle} onChange={e => setMainTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={tagline} onChange={e => setTagline(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Warm Founder Note (Displayed on Catalogue)</label>
            <textarea className="w-full border rounded px-3 py-2 h-24" value={founderNote} onChange={e => setFounderNote(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-sm w-full sm:w-auto">
          Save Branding
        </button>
      </form>
    </div>
  );
}

function CreationsManagerTab({ participants }: any) {
  const [selectedId, setSelectedId] = useState('');
  const [creations, setCreations] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newCreationTitle, setNewCreationTitle] = useState('');
  const [newCreationCategory, setNewCreationCategory] = useState(CATEGORIES[0]);
  const [newCreationDesc, setNewCreationDesc] = useState('');
  const [newCreationVideoUrl, setNewCreationVideoUrl] = useState('');

  useEffect(() => {
    if (selectedId) {
      db.getCreationsByParticipant(parseInt(selectedId)).then(setCreations);
    } else {
      setCreations([]);
    }
  }, [selectedId]);

  const handleDelete = async (id: number) => {
    if(confirm('Delete this creation?')) {
      await db.deleteCreation(id);
      setCreations(creations.filter(c => c.id !== id));
    }
  };

  const handleAddCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    const file = fileRef.current?.files?.[0];
    setUploading(true);
    let imageUrl = '';

    try {
      if (file) {
        imageUrl = await uploadImage(file);
      }
      
      const c: Partial<Creation> = {
        participant_id: parseInt(selectedId),
        project_title: newCreationTitle || 'Untitled',
        project_category: newCreationCategory,
        description: newCreationDesc,
        image_url: imageUrl,
        video_url: newCreationVideoUrl,
        display_order: creations.length + 1,
        is_active: true
      };
      
      const saved = await db.saveCreation(c);
      if (saved) {
        setCreations([...creations, saved]);
        setNewCreationTitle('');
        setNewCreationDesc('');
        setNewCreationVideoUrl('');
        if (fileRef.current) fileRef.current.value = '';
        alert('Photo Card created successfully!');
      }
    } catch (err) {
      alert('Failed to create photo card.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">Creations Manager</h2>
      <select className="w-full border rounded px-3 py-2 mb-6 max-w-md" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">Select Participant</option>
        {participants.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} (ID: {p.id})</option>)}
      </select>

      {selectedId && (
        <div className="space-y-6">
          <form onSubmit={handleAddCreation} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-4">+ Create Photo Card for Participant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={newCreationTitle} onChange={e => setNewCreationTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full border rounded px-3 py-2" value={newCreationCategory} onChange={e => setNewCreationCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Photo</label>
                <input type="file" accept="image/*" ref={fileRef} className="w-full border rounded px-3 py-2 bg-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video URL (Optional)</label>
                <input type="url" placeholder="https://..." className="w-full border rounded px-3 py-2" value={newCreationVideoUrl} onChange={e => setNewCreationVideoUrl(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2 h-20" value={newCreationDesc} onChange={e => setNewCreationDesc(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
              {uploading ? 'Uploading & Saving...' : 'Create Photo Card'}
            </button>
          </form>

          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Existing Creations</h3>
          {creations.map(c => (
            <div key={c.id} className="bg-gray-50 border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
              <div className="w-32 h-24 bg-gray-200 rounded shrink-0">
                {c.image_url && <img src={c.image_url} alt="img" className="w-full h-full object-cover rounded" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{c.project_title}</h3>
                <p className="text-sm text-gray-500">{c.project_category}</p>
                <p className="text-sm mt-2">{c.description}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleDelete(c.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {creations.length === 0 && <p className="text-gray-500">No creations found for this participant.</p>}
        </div>
      )}
    </div>
  );
}

function StoriesManagerTab({ participants }: any) {
  const [selectedId, setSelectedId] = useState('');
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    if (selectedId) {
      db.getStoriesByParticipant(parseInt(selectedId)).then(setStories);
    } else {
      setStories([]);
    }
  }, [selectedId]);

  const handleDelete = async (id: number) => {
    if(confirm('Delete this story?')) {
      await db.deleteStory(id);
      setStories(stories.filter(s => s.id !== id));
    }
  };

  const toggleFeatured = async (story: any) => {
    const updated = { ...story, featured_in_sdg_museum: !story.featured_in_sdg_museum };
    await db.saveStory(updated);
    setStories(stories.map(s => s.id === story.id ? updated : s));
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">Stories Manager</h2>
      <select className="w-full border rounded px-3 py-2 mb-6 max-w-md" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">Select Participant</option>
        {participants.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} (ID: {p.id})</option>)}
      </select>

      {selectedId && (
        <div className="space-y-4">
          {stories.map(s => (
            <div key={s.id} className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-bold mb-1">{s.title} <span className="text-xs font-normal bg-gray-200 px-2 py-0.5 rounded ml-2">{s.story_type}</span></h3>
              <p className="text-sm mt-2 line-clamp-3 text-gray-600 mb-4">{s.written_text}</p>
              
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={s.featured_in_sdg_museum} onChange={() => toggleFeatured(s)} className="rounded" />
                  <span className="text-sm font-medium">Featured in SDG Museum</span>
                </label>
                <button onClick={() => handleDelete(s.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">Delete</button>
              </div>
            </div>
          ))}
          {stories.length === 0 && <p className="text-gray-500">No stories found for this participant.</p>}
        </div>
      )}
    </div>
  );
}