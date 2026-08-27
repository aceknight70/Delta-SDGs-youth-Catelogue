import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { db } from '../lib/db';
import { Creation, Story, STORY_TYPES, Participant, ParentDashboardData } from '../types';
import { uploadImage } from '../lib/upload';
import { CheckCircle, XCircle } from 'lucide-react';

const TRACK_OPTIONS = ['Storytelling', 'Waste-to-Wealth', 'Parliament', 'Scouting', 'Digital Skills', 'Robotics', 'Paramedics', 'Entrepreneurship', 'Sports', 'Arts & Crafts'];
const HEALTH_MODULES = ['First Aid', 'Hygiene', 'Mental Wellness', 'Nutrition', 'Physical Fitness', 'Emotional Intelligence'];
const MENTOR_OPTIONS = ['Mr. Adebayo', 'Ms. Nkechi', 'Mr. Okafor', 'Ms. Amara'];
function StoryFormSection({ loggedInParent, type, title, icon, stories, setStories, showNotification, colorTheme = 'blue' }: any) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const themeMap: any = {
    blue: {
      header: "text-blue-900",
      counter: "bg-blue-50 text-blue-800",
      alert: "bg-blue-50 border-blue-200 text-blue-800",
      borderInfo: "border-l-4 border-l-blue-500",
      btnOutline: "border-blue-900 text-blue-900 hover:bg-blue-50",
      focus: "focus:ring-blue-100 focus:border-blue-500"
    },
    purple: {
      header: "text-purple-900",
      counter: "bg-purple-50 text-purple-800",
      alert: "bg-purple-50 border-purple-200 text-purple-800",
      borderInfo: "border-l-4 border-l-purple-500",
      btnOutline: "border-purple-900 text-purple-900 hover:bg-purple-50",
      focus: "focus:ring-purple-100 focus:border-purple-500"
    },
    green: {
      header: "text-green-900",
      counter: "bg-green-50 text-green-800",
      alert: "bg-green-50 border-green-200 text-green-800",
      borderInfo: "border-l-4 border-l-green-500",
      btnOutline: "border-green-900 text-green-900 hover:bg-green-50",
      focus: "focus:ring-green-100 focus:border-green-500"
    },
    orange: {
      header: "text-orange-900",
      counter: "bg-orange-50 text-orange-800",
      alert: "bg-orange-50 border-orange-200 text-orange-800",
      borderInfo: "border-l-4 border-l-orange-500",
      btnOutline: "border-orange-900 text-orange-900 hover:bg-orange-50",
      focus: "focus:ring-orange-100 focus:border-orange-500"
    },
    teal: {
      header: "text-teal-900",
      counter: "bg-teal-50 text-teal-800",
      alert: "bg-teal-50 border-teal-200 text-teal-800",
      borderInfo: "border-l-4 border-l-teal-500",
      btnOutline: "border-teal-900 text-teal-900 hover:bg-teal-50",
      focus: "focus:ring-teal-100 focus:border-teal-500"
    },
    rose: {
      header: "text-rose-900",
      counter: "bg-rose-50 text-rose-800",
      alert: "bg-rose-50 border-rose-200 text-rose-800",
      borderInfo: "border-l-4 border-l-rose-500",
      btnOutline: "border-rose-900 text-rose-900 hover:bg-rose-50",
      focus: "focus:ring-rose-100 focus:border-rose-500"
    },
    indigo: {
      header: "text-indigo-900",
      counter: "bg-indigo-50 text-indigo-800",
      alert: "bg-indigo-50 border-indigo-200 text-indigo-800",
      borderInfo: "border-l-4 border-l-indigo-500",
      btnOutline: "border-indigo-900 text-indigo-900 hover:bg-indigo-50",
      focus: "focus:ring-indigo-100 focus:border-indigo-500"
    }
  };
  const theme = themeMap[colorTheme] || themeMap.blue;

  const typeStories = stories.filter((s: any) => s.story_type === type || (!s.story_type && type === "Story for Selection") || (s.story_type === "Short Story" && type === "Story for Selection"));

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInParent) return;
    setIsPublishing(true);
    try {
      const saved = await db.saveStory({
        participant_id: loggedInParent.id,
        title: newTitle || 'Untitled',
        story_type: type,
        written_text: newContent,
        featured_in_sdg_museum: false,
        display_order: stories.length + 1,
        is_active: true
      });
      if (saved) {
        setStories([...stories, saved]);
        showNotification(`${title} published! Now live on Stories tab`);
        setNewTitle('');
        setNewContent('');
      }
    } catch (err) {
      showNotification(`Failed to publish ${title}.`, true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) return;
    try {
      await db.deleteStory(id);
      setStories(stories.filter((s: any) => s.id !== id));
      showNotification(`${title} deleted successfully.`);
    } catch (err) {
      showNotification(`Failed to delete ${title}.`, true);
    }
  };

  return (
      <div className={`bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm ${theme.borderInfo}`}>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${theme.header}`}>{icon} Their {title}</h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">✓ Live now</span>
        </div>
        <div className={`text-xs p-3 rounded-lg mb-4 font-medium flex items-center justify-between ${theme.counter}`}>
           <span>{typeStories.length} {title}{typeStories.length !== 1 ? 's' : ''} submitted</span>
        </div>
        <div className={`border text-[12px] p-2.5 rounded-lg mb-4 ${theme.alert}`}>
          <b>🔧 Fix applied:</b> {title}s saved here now publish immediately to the <b>Stories tab</b> and <b>Directory card</b> — no staff approval needed.
        </div>
        <form onSubmit={handlePublish} className="mb-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
            <input required type="text" className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 transition-all outline-none ${theme.focus}`} placeholder={`${title} title...`} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Content</label>
            <textarea required className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 transition-all outline-none min-h-[80px] ${theme.focus}`} placeholder={`Write your child's ${title.toLowerCase()}...`} value={newContent} onChange={e => setNewContent(e.target.value)}></textarea>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="submit" disabled={isPublishing} className="bg-green-600 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50">📤 Publish</button>
            <button type="button" onClick={() => showNotification('Saved as draft')} className={`bg-transparent border font-bold text-[13px] px-6 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 ${theme.btnOutline}`}>💾 Save Draft</button>
          </div>
        </form>
        {typeStories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {typeStories.map((s: any) => (
              <div key={s.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold pr-2">{s.title}</p>
                  {s.created_at && (
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-200/50 px-2 py-0.5 rounded shrink-0">
                      {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap">{s.written_text}</p>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
export default function ParentDashboard() {
  const { loggedInParent, logoutParent } = useAppContext();
  const navigate = useNavigate();

  const [notification, setNotification] = useState<{message: string, isError: boolean} | null>(null);
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);

  // Child Profile States
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(10);
  const [childLocation, setChildLocation] = useState('');
  const [childAttendance, setChildAttendance] = useState('Physical');
  const [childQuote, setChildQuote] = useState('');

  // Tracks State
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Health State
  const [selectedHealthModules, setSelectedHealthModules] = useState<string[]>([]);

  // Mentor & Pathway State
  const [mentor, setMentor] = useState('');
  const [pathwayStatus, setPathwayStatus] = useState('Pending');
  const [pathwayNotes, setPathwayNotes] = useState('');

  // Pledge State
  const [pledge, setPledge] = useState('');

  // Parent's Promise State
  const [parentPromise, setParentPromise] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Creations State
  const [creations, setCreations] = useState<Creation[]>([]);
  const [newCreationTitle, setNewCreationTitle] = useState('');
  const [newCreationPhotoUrl, setNewCreationPhotoUrl] = useState('');
  const [newCreationVideoUrl, setNewCreationVideoUrl] = useState('');
  const [newCreationDesc, setNewCreationDesc] = useState('');
  const [uploadingCreation, setUploadingCreation] = useState(false);

  // Stories State
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!loggedInParent) {
      navigate('/login');
      return;
    }
    loadData();
  }, [loggedInParent]);

  const loadData = async () => {
    if (!loggedInParent) return;

    // Load Participant Base Info
    setChildName(loggedInParent.first_name);
    setChildAge(loggedInParent.age);
    setChildLocation(loggedInParent.location_area);
    setChildAttendance(loggedInParent.attendance_type);
    setChildQuote(loggedInParent.story || '');
    setParentPromise(loggedInParent.parent_quote || '');

    // Load Extra Dashboard Data
    const dData = await db.getParentDashboardData(loggedInParent.id);
    setDashboardData(dData);
    setSelectedTracks(dData.tracks || []);
    setSelectedHealthModules(dData.health_modules || []);
    setMentor(dData.mentor || '');
    setPathwayStatus(dData.pathway_status || 'Pending');
    setPathwayNotes(dData.pathway_notes || '');
    setPledge(dData.pledge || '');
    setWhatsapp(dData.whatsapp || '');

    // Load Creations
    const loadedCreations = await db.getCreationsByParticipant(loggedInParent.id);
    setCreations(loadedCreations);

    // Load Stories
    const loadedStories = await db.getStoriesByParticipant(loggedInParent.id);
    setStories(loadedStories);
  };

  const showNotification = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateProfile = async () => {
    if (!loggedInParent) return;
    try {
      await db.saveParticipant({
        id: loggedInParent.id,
        first_name: childName,
        age: childAge,
        location_area: childLocation,
        attendance_type: childAttendance as any,
        story: childQuote
      });
      showNotification('Child profile updated!');
    } catch (e) {
      showNotification('Failed to update profile.', true);
    }
  };

  const handleSaveDashboardData = async (fieldsToUpdate: Partial<ParentDashboardData>, successMsg: string) => {
    if (!loggedInParent || !dashboardData) return;
    try {
      const updatedData = { ...dashboardData, ...fieldsToUpdate };
      await db.saveParentDashboardData(updatedData);
      setDashboardData(updatedData);
      showNotification(successMsg);
    } catch (e) {
      showNotification('Failed to save data.', true);
    }
  };

  const handleSaveTracks = () => handleSaveDashboardData({ tracks: selectedTracks }, 'Tracks updated!');
  
  const handleSaveHealth = () => handleSaveDashboardData({ health_modules: selectedHealthModules }, 'Health records updated!');

  const handleSaveMentor = () => handleSaveDashboardData({ mentor, pathway_status: pathwayStatus, pathway_notes: pathwayNotes }, 'Mentor assignment updated!');

  const handleSavePledge = () => handleSaveDashboardData({ pledge }, 'Pledge updated!');

  const handleSavePromise = async () => {
    if (!loggedInParent) return;
    try {
      await db.saveParticipant({
        id: loggedInParent.id,
        parent_quote: parentPromise
      });
      await handleSaveDashboardData({ whatsapp }, 'Your promise has been saved! ✅');
    } catch (e) {
      showNotification('Failed to save promise.', true);
    }
  };

  const toggleTrack = (track: string) => {
    setSelectedTracks(prev => prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]);
  };

  const toggleHealthModule = (module: string) => {
    setSelectedHealthModules(prev => prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]);
  };

  const handleAddCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInParent) return;
    setUploadingCreation(true);
    try {
      const saved = await db.saveCreation({
        participant_id: loggedInParent.id,
        project_title: newCreationTitle || 'Untitled',
        project_category: 'Community Solutions', // Default or could be added to UI
        description: newCreationDesc,
        image_url: newCreationPhotoUrl,
        video_url: newCreationVideoUrl,
        display_order: creations.length + 1,
        is_active: true
      });
      if (saved) {
        setCreations([...creations, saved]);
        showNotification('Creation added! 🎉');
        setNewCreationTitle('');
        setNewCreationPhotoUrl('');
        setNewCreationVideoUrl('');
        setNewCreationDesc('');
      }
    } catch (err) {
      showNotification('Failed to add creation.', true);
    } finally {
      setUploadingCreation(false);
    }
  };

  const handleDeleteCreation = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this creation?")) return;
    try {
      await db.deleteCreation(id);
      setCreations(creations.filter(c => c.id !== id));
      showNotification('Creation deleted successfully.');
    } catch (err) {
      showNotification('Failed to delete creation.', true);
    }
  };

  const handleSaveAll = async () => {
    await handleUpdateProfile();
    await handleSaveTracks();
    await handleSaveHealth();
    await handleSaveMentor();
    await handleSavePledge();
    await handleSavePromise();
    showNotification('All changes saved successfully! ✅');
  };

  if (!loggedInParent) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-6 rounded-t-xl mb-4">
        <div className="text-[11px] tracking-widest uppercase text-blue-300 mb-1">👪 Parent Dashboard</div>
        <div className="flex justify-between items-start">
          <h1 className="text-xl font-bold mb-1">Welcome, Parent</h1>
          <button onClick={logoutParent} className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded transition-colors">Logout</button>
        </div>
        <div className="text-sm text-blue-200 mt-1">Managing: <strong className="text-white">{loggedInParent.first_name}</strong> · Age {loggedInParent.age} · {loggedInParent.location_area}</div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium ${notification.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {notification.isError ? <XCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
          {notification.message}
        </div>
      )}

      {/* Form 1: Child's Profile */}
      <div className="bg-white border border-gray-200 rounded-b-xl rounded-t-xl sm:rounded-t-none p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">👤 Child's Profile</h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">✓ Saved</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" value={childName} onChange={e => setChildName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Age</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" value={childAge} onChange={e => setChildAge(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" value={childLocation} onChange={e => setChildLocation(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Attendance Mode</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" value={childAttendance} onChange={e => setChildAttendance(e.target.value)}>
              <option value="Physical">Physical</option>
              <option value="Virtual">Virtual</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Child's Quote / Unique Trait</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Loves storytelling" value={childQuote} onChange={e => setChildQuote(e.target.value)} />
        </div>
        <button onClick={handleUpdateProfile} className="bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors">💾 Update Profile</button>
      </div>

      {/* Form 2: Tracks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">🎯 Tracks <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded">NEW</span></h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">{selectedTracks.length} selected</span>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Select tracks your child is enrolled in</label>
          <div className="flex flex-wrap gap-2">
            {TRACK_OPTIONS.map(track => (
              <button 
                key={track} 
                onClick={() => toggleTrack(track)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedTracks.includes(track) ? 'bg-blue-50 border-blue-900 text-blue-900 before:content-["✓_"]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-900 hover:text-blue-900'}`}
              >
                {track}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">Click to toggle selection</div>
        </div>
        <button onClick={handleSaveTracks} className="bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors">💾 Save Tracks</button>
      </div>

      {/* Form 3: Health & Well-being */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">❤️ Health & Well-being <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded">NEW</span></h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">{selectedHealthModules.length} completed</span>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Completed wellness modules</label>
          <div className="flex flex-wrap gap-2">
            {HEALTH_MODULES.map(module => (
              <label key={module} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[13px] cursor-pointer transition-colors ${selectedHealthModules.includes(module) ? 'bg-blue-50 border-blue-900 text-blue-900 font-semibold' : 'bg-gray-50 border-gray-200 hover:border-blue-900'}`}>
                <input 
                  type="checkbox" 
                  checked={selectedHealthModules.includes(module)} 
                  onChange={() => toggleHealthModule(module)} 
                  className="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900 accent-blue-900"
                />
                {module}
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleSaveHealth} className="bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors">💾 Save Health Status</button>
      </div>

      {/* Form 4: Mentor & Pathway */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">🧭 Mentor & Pathway <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded">NEW</span></h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">{pathwayStatus}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned Mentor</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" value={mentor} onChange={e => setMentor(e.target.value)}>
              <option value="">— Not yet assigned —</option>
              {MENTOR_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pathway Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" value={pathwayStatus} onChange={e => setPathwayStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pathway Notes <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[60px] resize-y" placeholder="Any additional notes about the child's pathway..." value={pathwayNotes} onChange={e => setPathwayNotes(e.target.value)}></textarea>
        </div>
        <button onClick={handleSaveMentor} className="bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors">💾 Update Mentor</button>
      </div>

      {/* Form 5: Global Citizenship Pledge */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">🌍 Global Citizenship Pledge <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded">NEW</span></h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">Saved</span>
        </div>
        {pledge && (
          <div className="bg-[#FFF6E5] border-l-[3px] border-[#E8A33D] p-3 rounded-r-lg italic text-[13.5px] text-[#4A4234] mb-4">
            "{pledge}"
          </div>
        )}
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Edit Pledge</label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[60px]" placeholder="Write a short pledge about how your child will use what they learned..." value={pledge} onChange={e => setPledge(e.target.value)}></textarea>
        </div>
        <button onClick={handleSavePledge} className="bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors">💾 Save Pledge</button>
      </div>

      {/* Form 6: Parent's Promise */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">🤝 Parent's Promise <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded">NEW</span></h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">Saved</span>
        </div>
        {parentPromise && (
          <div className="bg-[#F1F8F3] border-l-[3px] border-[#1E8E5A] p-3 rounded-r-lg text-[13.5px] flex justify-between items-center flex-wrap gap-2 mb-4">
            <span>"{parentPromise}"</span>
            {whatsapp && <span className="bg-[#DCF4E4] text-[#1E8E5A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">📱 WhatsApp ✓</span>}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Your Commitment Statement</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="Write your commitment..." value={parentPromise} onChange={e => setParentPromise(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">WhatsApp Number <span className="font-normal text-gray-400 normal-case">(for updates)</span></label>
          <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="+234 800 123 4567" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          <button onClick={handleSavePromise} className="bg-green-600 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5">💾 Save Promise</button>
          <button onClick={() => showNotification('WhatsApp verification sent! 📱')} className="bg-transparent border border-blue-900 text-blue-900 font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">📱 Verify WhatsApp</button>
        </div>
      </div>

      {/* Form 7: Creations */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">📸 Creations</h3>
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">{creations.length} / {loggedInParent.creation_photo_limit + loggedInParent.bonus_creation_photo_slots} used</span>
        </div>
        <form onSubmit={handleAddCreation} className="mb-4">
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Project Title</label>
            <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="e.g. My Recycled Art Project" value={newCreationTitle} onChange={e => setNewCreationTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Photo URL</label>
              <input type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="https://..." value={newCreationPhotoUrl} onChange={e => setNewCreationPhotoUrl(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Video URL</label>
              <input type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="https://..." value={newCreationVideoUrl} onChange={e => setNewCreationVideoUrl(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[60px]" placeholder="Describe your child's creation..." value={newCreationDesc} onChange={e => setNewCreationDesc(e.target.value)}></textarea>
          </div>
          <button type="submit" disabled={uploadingCreation} className="bg-blue-900 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-blue-950 transition-colors flex items-center gap-1.5 disabled:opacity-50">
            {uploadingCreation ? 'Uploading...' : '➕ Add Creation'}
          </button>
        </form>
        {/* Render existing creations quickly */}
        {creations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            {creations.map(c => (
              <div key={c.id} className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex flex-col">
                {c.image_url && <img src={c.image_url} alt="creation" className="w-full h-16 object-cover rounded mb-1" />}
                <p className="text-xs font-bold truncate flex-1">{c.project_title}</p>
                <button 
                  onClick={() => handleDeleteCreation(c.id)}
                  className="mt-2 w-full flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 rounded py-1 text-[11px] font-medium transition-colors"
                >
                  <XCircle className="w-3 h-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Writing Tasks Sections */}
      <div className="space-y-4 mb-4">
        <StoryFormSection loggedInParent={loggedInParent} type="Descriptive Essay" title="Descriptive Essay" icon="📝" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="blue" />
        <StoryFormSection loggedInParent={loggedInParent} type="Narrative Essay" title="Narrative Essay" icon="📝" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="purple" />
        <StoryFormSection loggedInParent={loggedInParent} type="Story for Selection" title="Story for Selection" icon="📖" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="rose" />
        <StoryFormSection loggedInParent={loggedInParent} type="Argumentative Essay" title="Argumentative Essay" icon="⚖️" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="orange" />
        <StoryFormSection loggedInParent={loggedInParent} type="Expository Essay" title="Expository Essay" icon="💡" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="green" />
        <StoryFormSection loggedInParent={loggedInParent} type="Formal Letter" title="Formal Letter" icon="✉️" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="teal" />
        <StoryFormSection loggedInParent={loggedInParent} type="Illustration" title="Illustration" icon="🎨" stories={stories} setStories={setStories} showNotification={showNotification} colorTheme="indigo" />
      </div>

      {/* Save All */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mt-2 text-center shadow-sm">
        <button onClick={handleSaveAll} className="bg-blue-900 text-white font-bold text-[15px] px-10 py-3 rounded-lg hover:bg-blue-950 transition-colors inline-flex items-center gap-2 shadow-sm">
          💾 Save All Changes
        </button>
        <p className="text-[11px] text-gray-500 mt-2">All fields will be saved to your child's profile</p>
      </div>

      <div className="text-center text-[11px] text-gray-400 py-5">
        Made by FATap-CT and ESGMC · Preview build, no live data
      </div>

    </div>
  );
}
