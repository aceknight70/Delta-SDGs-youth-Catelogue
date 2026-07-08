import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { db } from '../lib/db';
import { Creation, Story, STORY_TYPES, CATEGORIES, Participant } from '../types';
import { uploadImage } from '../lib/upload';

export default function ParentDashboard() {
  const { loggedInParent, logoutParent } = useAppContext();
  const navigate = useNavigate();
  
  const [creations, setCreations] = useState<Creation[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  
  // Edit states
  const [parentQuote, setParentQuote] = useState('');
  const [newPin, setNewPin] = useState('');
  
  const [newCreationTitle, setNewCreationTitle] = useState('');
  const [newCreationCategory, setNewCreationCategory] = useState(CATEGORIES[0]);
  const [newCreationDesc, setNewCreationDesc] = useState('');
  const [newCreationVideoUrl, setNewCreationVideoUrl] = useState('');
  
  const [newStory, setNewStory] = useState<Partial<Story>>({ title: '', story_type: 'Short Story', written_text: '' });
  
  const [uploadingParentPhoto, setUploadingParentPhoto] = useState(false);
  const [uploadingCreation, setUploadingCreation] = useState(false);

  // Sync state correctly when logged in parent changes
  useEffect(() => {
    if (!loggedInParent) {
      navigate('/login');
      return;
    }
    setParentQuote(loggedInParent.parent_quote || '');
    
    const load = async () => {
      const c = await db.getCreationsByParticipant(loggedInParent.id);
      setCreations(c);
      const s = await db.getStoriesByParticipant(loggedInParent.id);
      setStories(s);
    };
    load();
  }, [loggedInParent, navigate]);

  if (!loggedInParent) return null;

  const handleLogout = () => {
    logoutParent();
    navigate('/');
  };

  const handleParentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingParentPhoto(true);
    try {
      const url = await uploadImage(file);
      const updated = { ...loggedInParent, parent_photo_url: url };
      await db.saveParticipant(updated);
      alert('Photo uploaded successfully! Saved!');
      // Update local state without full reload
      loggedInParent.parent_photo_url = url; 
    } catch (err) {
      alert('Failed to upload photo.');
    } finally {
      setUploadingParentPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const quote = parentQuote;
    const pin = newPin.trim();
    
    const updated: Partial<Participant> = { ...loggedInParent, parent_quote: quote };
    if (pin) updated.participant_access_pin = pin;
    
    try {
      await db.saveParticipant(updated);
      alert('Profile details saved!');
      setNewPin('');
    } catch (err) {
      alert('Error saving details.');
    }
  };

  const handleAddCreation = async (e: React.FormEvent, fileInputRef: React.RefObject<HTMLInputElement>) => {
    e.preventDefault();
    
    // Capture state synchronously before any awaits
    const title = newCreationTitle;
    const category = newCreationCategory;
    const desc = newCreationDesc;
    const vUrl = newCreationVideoUrl;
    const file = fileInputRef.current?.files?.[0];
    
    const photoLimit = loggedInParent.creation_photo_limit + loggedInParent.bonus_creation_photo_slots;
    if (creations.length >= photoLimit) {
      alert(`You have reached the maximum allowed creations (${photoLimit}).`);
      return;
    }
    
    setUploadingCreation(true);
    let imageUrl = '';
    
    try {
      if (file) {
        imageUrl = await uploadImage(file);
      }
      
      const c: Partial<Creation> = {
        participant_id: loggedInParent.id,
        project_title: title,
        project_category: category,
        description: desc,
        image_url: imageUrl,
        video_url: vUrl,
        display_order: creations.length + 1,
        is_active: true
      };
      
      const saved = await db.saveCreation(c);
      if (saved) {
        setCreations([...creations, saved]);
        setNewCreationTitle('');
        setNewCreationDesc('');
        setNewCreationVideoUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert('Creation added successfully! Saved!');
      }
    } catch (err) {
      alert('Failed to add creation.');
    } finally {
      setUploadingCreation(false);
    }
  };

  const CreationForm = () => {
    const fileRef = React.useRef<HTMLInputElement>(null);
    return (
      <form onSubmit={(e) => handleAddCreation(e, fileRef)} className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
        <h3 className="font-medium text-gray-900 mb-3">+ Add New Creation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input required type="text" placeholder="Project Title" className="px-3 py-2 border rounded focus:outline-none" value={newCreationTitle} onChange={e => setNewCreationTitle(e.target.value)} />
          <select className="px-3 py-2 border rounded focus:outline-none" value={newCreationCategory} onChange={e => setNewCreationCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
            <input type="file" accept="image/*" ref={fileRef} className="px-3 py-2 border rounded focus:outline-none w-full bg-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Video URL (Optional)</label>
            <input type="url" placeholder="https://..." className="px-3 py-2 border rounded focus:outline-none w-full" value={newCreationVideoUrl} onChange={e => setNewCreationVideoUrl(e.target.value)} />
          </div>
          <textarea placeholder="Description" className="sm:col-span-2 px-3 py-2 border rounded focus:outline-none h-20" value={newCreationDesc} onChange={e => setNewCreationDesc(e.target.value)} />
        </div>
        {loggedInParent.attendance_type === 'Remote' && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs p-3 rounded mb-4">
            <strong>Video Safety Rule (Remote):</strong> Video MUST show the CREATION ONLY. It must NOT show the child's face.
          </div>
        )}
        <button type="submit" disabled={uploadingCreation} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
          {uploadingCreation ? 'Uploading & Saving...' : 'Upload Creation'}
        </button>
      </form>
    );
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newStory.title;
    const type = newStory.story_type;
    const text = newStory.written_text;
    
    if (!title || !text) return;

    try {
      const s: Partial<Story> = {
        participant_id: loggedInParent.id,
        title: title,
        story_type: type as any,
        written_text: text,
        featured_in_sdg_museum: false,
        display_order: stories.length + 1,
        is_active: true
      };
      const saved = await db.saveStory(s);
      if (saved) {
        setStories([...stories, saved]);
        setNewStory({ title: '', story_type: 'Short Story', written_text: '' });
        alert('Story saved successfully!');
      }
    } catch (err) {
      alert('Failed to save story.');
    }
  };

  const handleDeleteCreation = async (id: number) => {
    if(confirm('Delete this creation?')) {
      await db.deleteCreation(id);
      setCreations(creations.filter(c => c.id !== id));
      alert('Creation deleted.');
    }
  }

  const handleDeleteStory = async (id: number) => {
    if(confirm('Delete this story?')) {
      await db.deleteStory(id);
      setStories(stories.filter(s => s.id !== id));
      alert('Story deleted.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
        <h1 className="text-2xl font-bold text-blue-900">👪 Welcome, Parent of {loggedInParent.first_name}!</h1>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <button onClick={handleLogout} className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Child's Profile Info</h2>
          <div className="space-y-3 text-sm flex-1">
            <p><span className="font-medium text-gray-500">Name:</span> {loggedInParent.first_name}</p>
            <p><span className="font-medium text-gray-500">Age:</span> {loggedInParent.age}</p>
            <p><span className="font-medium text-gray-500">Location:</span> {loggedInParent.location_area}</p>
            <p><span className="font-medium text-gray-500">Attendance:</span> {loggedInParent.attendance_type}</p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700 italic">
              "{loggedInParent.story}"
            </div>
            <p className="text-xs text-gray-400 mt-2">Note: To change your child's basic details or their story text, please contact staff.</p>
          </div>
          
          <div className="mt-4 pt-4 border-t">
             <label className="block text-sm font-medium text-gray-700 mb-2">Your Parent Photo (Optional)</label>
             <div className="flex items-center gap-4">
               {loggedInParent.parent_photo_url ? (
                 <img src={loggedInParent.parent_photo_url} alt="Parent" className="w-12 h-12 rounded-full object-cover shadow-sm" />
               ) : (
                 <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 text-sm">N/A</div>
               )}
               <input type="file" accept="image/*" onChange={handleParentPhotoUpload} disabled={uploadingParentPhoto} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
             </div>
             {uploadingParentPhoto && <span className="text-xs text-blue-600 mt-1 block">Uploading...</span>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Update Your Details</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Quote</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none h-20"
                value={parentQuote}
                onChange={(e) => setParentQuote(e.target.value)}
                placeholder="A short quote about how proud you are..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Change PIN (optional)</label>
              <input 
                type="text" 
                placeholder="New PIN"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 w-full">Save Details</button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900">📸 Creations</h2>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
            {creations.length} / {loggedInParent.creation_photo_limit + loggedInParent.bonus_creation_photo_slots} used
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {creations.map(c => (
            <div key={c.id} className="border rounded-lg p-3 bg-gray-50 relative group">
              <button type="button" onClick={() => handleDeleteCreation(c.id)} className="absolute top-2 right-2 bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              <div className="h-24 bg-gray-200 rounded mb-2 overflow-hidden">
                {c.image_url ? <img src={c.image_url} alt="project" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>}
              </div>
              <p className="font-bold text-sm truncate">{c.project_title}</p>
              <p className="text-xs text-gray-500 truncate">{c.project_category}</p>
              {c.video_url && <p className="text-xs text-blue-500 mt-1">🎥 Video attached</p>}
            </div>
          ))}
        </div>

        <CreationForm />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">📝 Their Stories</h2>
        
        <div className="space-y-4 mb-6">
          {stories.map(s => (
            <div key={s.id} className="border rounded-lg p-4 bg-gray-50 relative group">
              <button type="button" onClick={() => handleDeleteStory(s.id)} className="absolute top-2 right-2 bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              <h3 className="font-bold">{s.title} <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded ml-2">{s.story_type}</span></h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.written_text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddStory} className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <h3 className="font-medium text-gray-900 mb-3">+ Add New Story</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input required type="text" placeholder="Story Title" className="px-3 py-2 border rounded focus:outline-none" value={newStory.title} onChange={e => setNewStory({...newStory, title: e.target.value})} />
            <select className="px-3 py-2 border rounded focus:outline-none" value={newStory.story_type} onChange={e => setNewStory({...newStory, story_type: e.target.value})}>
              {STORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea required placeholder="Write the story here..." className="sm:col-span-2 px-3 py-2 border rounded focus:outline-none h-32" value={newStory.written_text} onChange={e => setNewStory({...newStory, written_text: e.target.value})} />
          </div>
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800">Save Story</button>
        </form>
      </div>

    </div>
  );
}
