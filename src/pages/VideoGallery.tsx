import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Creation } from '../types';

export default function VideoGallery() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Get all participants
      const participants = await db.getParticipants();
      // Filter to approved ones
      const publicParticipants = participants.filter(p => p.application_status === 'Approved' && p.guardian_consent);
      const ids = publicParticipants.map(p => p.id);
      
      let allCreations: Creation[] = [];
      for (const id of ids) {
        const c = await db.getCreationsByParticipant(id);
        allCreations = [...allCreations, ...c];
      }
      
      setCreations(allCreations.filter(c => c.video_url));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading Video Gallery...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Video Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creations.map((c, i) => (
          <div key={`${c.id}-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-100 flex flex-col items-center justify-center border-b">
              <span className="text-5xl mb-2">🎥</span>
              <a href={c.video_url!} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700">
                Watch Video
              </a>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{c.project_title}</h3>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block mt-2">{c.project_category}</span>
            </div>
          </div>
        ))}
        {creations.length === 0 && <div className="col-span-full text-center text-gray-500 py-12">No videos available in the gallery yet.</div>}
      </div>
    </div>
  );
}
