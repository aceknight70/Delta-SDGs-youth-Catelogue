import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Story, Participant, STORY_TYPES } from '../types';
import ScrollableTextBox from '../components/ScrollableTextBox';
import { Search } from 'lucide-react';

interface StoryWithAuthor extends Story {
  authorName: string;
}

export default function StoriesRoom() {
  const [stories, setStories] = useState<StoryWithAuthor[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      const allStories = await db.getStories();
      const allParticipants = await db.getParticipants();
      
      const combined: StoryWithAuthor[] = [];
      
      for (const s of allStories) {
        if (!s.is_active) continue;
        const p = allParticipants.find(p => p.id === s.participant_id);
        // Only show if author is approved and has consent
        if (p && p.application_status === 'Approved' && p.guardian_consent) {
          combined.push({ ...s, authorName: p.first_name });
        }
      }
      
      setStories(combined.sort((a,b) => a.display_order - b.display_order));
    };
    load();
  }, []);

  const filtered = stories.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.written_text.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && s.story_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
          📝 THEIR STORIES
        </h1>
        <p className="text-gray-600 text-lg">Young voices, powerful words</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search stories..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {STORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="mb-4 text-gray-500 font-medium">{filtered.length} stories found</div>

      <div className="space-y-8">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h2>
            <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <span className="font-medium text-blue-600">by {s.authorName}</span>
              <span>|</span>
              <span>{s.story_type}</span>
              {s.featured_in_sdg_museum && (
                <>
                  <span>|</span>
                  <span className="text-yellow-600 font-medium flex items-center gap-1"><span className="text-xs">🏛️</span> Featured in Museum</span>
                </>
              )}
            </div>
            
            <ScrollableTextBox className="bg-white border-none shadow-none p-0 max-h-[250px]">
              {s.written_text}
            </ScrollableTextBox>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No stories found matching your criteria.</div>
        )}
      </div>
    </div>
  );
}
