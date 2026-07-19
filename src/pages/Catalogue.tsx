import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { db } from '../lib/db';
import { Participant, Creation, CATEGORIES } from '../types';
import { useAppContext } from '../store/AppContext';

export default function Catalogue() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { branding } = useAppContext();

  useEffect(() => {
    const load = async () => {
      const all = await db.getParticipants();
      // Only show approved and with consent for public catalogue
      const publicList = all.filter(p => p.application_status === 'Approved' && p.guardian_consent);
      setParticipants(publicList);
      
      const allC = await db.getAllCreations();
      setCreations(allC);
      
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

  const getHeadline = (pId: number) => {
    const pCreations = creations.filter(c => c.participant_id === pId);
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
      
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-center justify-center gap-3 mb-8 border border-yellow-200 shadow-sm">
        <span className="text-2xl">🌟</span>
        <span className="font-semibold text-lg">{approvedCount} young innovators showcased this year</span>
      </div>

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Welcome to Youngsters → Youth Catalogue</h1>
        {branding?.founder_note && (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center italic text-gray-700 text-lg mb-6">
            "{branding.founder_note}"
          </div>
        )}
        <div className="text-center">
          <a href="https://sdg-summer-camp-2026-updated.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <span>🚀</span> Go to the Official SDG Summer Camp 2026 App
          </a>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search young innovators..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
        >
          <option value="">Age Filter</option>
          {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(a => <option key={a} value={a}>{a} years</option>)}
        </select>
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              <p className="text-sm font-medium text-blue-700 mb-2">{getHeadline(p.id)}</p>
              
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <span>{p.age} years old</span>
                <span className="mx-2">•</span>
                <MapPin className="w-3 h-3 mr-1" />
                <span>{p.location_area}</span>
              </div>

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
                <Link to={`/child/${p.id}`} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  <span className="text-lg">👁️</span> View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 rounded-2xl p-8 sm:p-12 text-white text-center shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">What Could Your Child Create?</h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto text-lg">
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
