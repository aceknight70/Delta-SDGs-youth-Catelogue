import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { db } from '../lib/db';
import { Participant, Creation, CATEGORIES, Story } from '../types';
import { useAppContext } from '../store/AppContext';

export default function Catalogue() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { branding, viewMode, setViewMode } = useAppContext();

  useEffect(() => {
    const load = async () => {
      const all = await db.getParticipants();
      // Only show approved and with consent for public catalogue
      const publicList = all.filter(p => p.application_status === 'Approved' && p.guardian_consent);
      setParticipants(publicList);
      
      const allC = await db.getAllCreations();
      setCreations(allC);
      
      const allS = await db.getStories();
      setStories(allS);
      
      const count = await db.getApprovedCount();
      setApprovedCount(count);
    };
    load();
  }, []);

  const filtered = participants.filter(p => {
    if (search && !p.first_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (ageFilter && p.age.toString() !== ageFilter) return false;
    if (locationFilter && !p.location_area.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    
    if (categoryFilter) {
      const pCreations = creations.filter(c => c.participant_id === p.id);
      if (!pCreations.some(c => c.project_category === categoryFilter)) return false;
    }
    
    return true;
  });

  const theme = viewMode === "youth" ? {
    btnPrimary: "bg-teal-600 hover:bg-teal-700",
    btnSecondary: "bg-teal-50 text-teal-700 hover:bg-teal-100",
    ring: "focus:ring-teal-500",
    textAccent: "text-teal-700",
    textMuted: "text-teal-200",
    bgDark: "bg-teal-900",
    textSubtitle: "text-amber-500",
    statsBadge: "bg-amber-100 text-amber-800 border-amber-200"
  } : {
    btnPrimary: "bg-blue-600 hover:bg-blue-700",
    btnSecondary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    ring: "focus:ring-blue-500",
    textAccent: "text-blue-700",
    textMuted: "text-blue-200",
    bgDark: "bg-blue-900",
    textSubtitle: "text-blue-700",
    statsBadge: "bg-green-50 text-green-700 border-green-200"
  };

  const getHeadline = (p: Participant) => {
    if (viewMode === 'youth') {
      if (p.sdg_goal_focus) {
        if (String(p.sdg_goal_focus).toLowerCase().includes('sdg')) return `${p.sdg_goal_focus} Youth Innovator`;
        return `${p.sdg_goal_focus} Advocate Youth Innovator`;
      }
      return "Vision-Led Youth Innovator";
    }
    const pCreations = creations.filter(c => c.participant_id === p.id);
    if (pCreations.length > 0) return pCreations[0].project_title;
    return "Young Innovator";
  };

  const getVideoUrl = (pId: number, p: Participant) => {
    const pCreations = creations.filter(c => c.participant_id === pId);
    const withVideo = pCreations.find(c => c.video_url);
    if (!withVideo) return null;
    
    if (p.attendance_type === 'Remote') return withVideo.video_url; 
    if (p.attendance_type === 'Physical' && p.guardian_consent) return withVideo.video_url;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center mb-12 mt-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
          Youngster-Youth Catalogue
        </h1>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
          <button
            onClick={() => setViewMode('youngster')}
            className={`px-8 py-3 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 ${viewMode === 'youngster' ? 'bg-white text-blue-700 shadow border border-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            Youngster
          </button>
          <button
            onClick={() => setViewMode('youth')}
            className={`px-8 py-3 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 ${viewMode === 'youth' ? 'bg-white text-teal-700 shadow border border-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            Youth
          </button>
        </div>
      </div>

      {branding?.founder_note && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center italic text-gray-700 text-lg mb-8">
          "{branding.founder_note}"
        </div>
      )}

      <div className="text-center mb-12">
        <a href="https://sdg-summer-camp-2026-updated.vercel.app/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${theme.btnPrimary} transition-colors shadow-sm px-6 py-3 font-bold text-white rounded-xl`}>
          <span>🚀</span> Go to the Official SDG Summer Camp 2026 App
        </a>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-center justify-center gap-3 border border-yellow-200 shadow-sm">
          <span className="text-2xl">🌟</span>
          <span className="font-semibold text-lg">{approvedCount} young innovators showcased this year</span>
        </div>

        {[
          { type: 'Descriptive Essay', icon: '📝', title: 'Descriptive Essays submitted' },
          { type: 'Narrative Essay', icon: '📝', title: 'Narrative Essays submitted' },
          { type: 'Story for Selection', icon: '🎬', title: 'incredible stories written fit for a Nollywood Short Film presentation!' },
          { type: 'Argumentative Essay', icon: '⚖️', title: 'Argumentative Essays submitted' },
          { type: 'Expository Essay', icon: '💡', title: 'Expository Essays submitted' },
          { type: 'Formal Letter', icon: '✉️', title: 'Formal Letters submitted' },
          { type: 'Illustration', icon: '🎨', title: 'Illustrations submitted' }
        ].map(config => {
          const typeCount = stories.filter(s => s.is_active !== false && (s.story_type === config.type || (!s.story_type && config.type === 'Story for Selection') || (s.story_type === 'Short Story' && config.type === 'Story for Selection'))).length;
          if (typeCount === 0) return null;
          return (
            <Link key={config.type} to="/stories" className="bg-purple-50 text-purple-800 p-4 rounded-xl flex items-center justify-center gap-3 border border-purple-200 shadow-sm hover:bg-purple-100 transition-colors">
              <span className="text-2xl">{config.icon}</span>
              <span className="font-semibold text-lg">
                {typeCount} {config.type === 'Story for Selection' ? `incredible stor${typeCount === 1 ? 'y' : 'ies'} written fit for a Nollywood Short Film presentation!` : config.title} Click to read.
              </span>
            </Link>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search young innovators..." 
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:outline-none`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className={`border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 ${theme.ring} focus:outline-none`}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className={`border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 ${theme.ring} focus:outline-none`}
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
        >
          <option value="">Age Filter</option>
          {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(a => <option key={a} value={a}>{a} years</option>)}
        </select>
        <select 
          className={`border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 ${theme.ring} focus:outline-none`}
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">Location Filter</option>
          {Array.from(new Set(participants.map(p => p.location_area))).map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>

      <div className="mb-4 text-gray-500 font-medium">{filtered.length} young innovators found</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-gray-100 relative">
              {p.participant_photo_url ? (
                <img src={p.participant_photo_url} alt={p.first_name} className="w-full h-full object-cover" />
              ) : p.parent_photo_url ? (
                <img src={p.parent_photo_url} alt="Parent" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🧑‍🤝‍🧑</div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{p.first_name}</h3>
              <p className={`text-sm font-medium ${theme.textSubtitle} mb-2`}>{getHeadline(p)}</p>
              
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <span>{p.age} years old</span>
                <span className="mx-2">•</span>
                <MapPin className="w-3 h-3 mr-1" />
                <span>{p.location_area}</span>
              </div>

              {(() => {
                const pStories = stories.filter(s => s.participant_id === p.id && s.is_active !== false);
                return pStories.length > 0 && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                      📝 {pStories.length} Published Stor{pStories.length > 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                );
              })()}

              {p.story && <p className="text-sm text-gray-600 line-clamp-3 mb-4">{p.story}</p>}

              {(p.sdg_goal_focus || p.supported_by) && (
                <div className="mb-4 flex flex-col gap-1 text-xs text-gray-600">
                  {p.sdg_goal_focus && <div><span className="font-semibold">SDG:</span> {p.sdg_goal_focus}</div>}
                  {p.supported_by && <div><span className="font-semibold">Supported by:</span> {p.supported_by}</div>}
                </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                {getVideoUrl(p.id, p) && (
                  <a href={getVideoUrl(p.id, p)!} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 transition-colors">
                    <span className="text-lg">🎥</span> Watch Video
                  </a>
                )}
                <Link to={`/child/${p.id}`} className={`w-full flex items-center justify-center gap-2 ${theme.btnSecondary} transition-colors font-medium py-2 rounded-lg`}>
                  <span className="text-lg">👁️</span> View Details
                </Link>
                {stories.filter(s => s.participant_id === p.id && s.is_active !== false).length > 0 && (
                  <Link to={`/child/${p.id}`} className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 font-medium py-2 rounded-lg hover:bg-green-100 transition-colors">
                    <span className="text-lg">📖</span> Read Story
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${theme.bgDark} rounded-2xl p-8 sm:p-12 text-white text-center shadow-lg relative overflow-hidden`}>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">What Could Your Child Create?</h2>
          <p className={`${theme.textMuted} mb-8 max-w-2xl mx-auto text-lg`}>
            Our young innovators are building the future. Get inspired by these project categories and imagine what your child could showcase in our next cohort!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-3">👗</div>
              <h3 className="font-bold text-lg">Recycled Fashion</h3>
            </div>
            <div className="bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-3">☀️</div>
              <h3 className="font-bold text-lg">Solar Projects</h3>
            </div>
            <div className="bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold text-lg">Art</h3>
            </div>
            <div className="bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-bold text-lg">Community Solutions</h3>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
