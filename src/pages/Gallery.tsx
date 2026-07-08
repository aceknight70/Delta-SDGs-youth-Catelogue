import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Creation } from '../types';

export default function Gallery() {
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
      // To avoid multiple queries for each, we could use a single supabase call,
      // but db.ts doesn't expose getAllCreations. We'll fetch for each participant since there aren't many.
      for (const id of ids) {
        const c = await db.getCreationsByParticipant(id);
        allCreations = [...allCreations, ...c];
      }
      
      setCreations(allCreations.filter(c => c.image_url));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading Gallery...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Project Gallery</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {creations.map((c, i) => (
          <a key={`${c.id}-${i}`} href={c.image_url!} target="_blank" rel="noopener noreferrer" className="bg-gray-100 rounded-lg overflow-hidden group relative block">
            <img src={c.image_url!} alt={c.project_title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm line-clamp-2">{c.project_title}</h3>
              <span className="text-white/80 text-xs mt-1">{c.project_category}</span>
            </div>
          </a>
        ))}
        {creations.length === 0 && <div className="col-span-full text-center text-gray-500 py-12">No images available in the gallery yet.</div>}
      </div>
    </div>
  );
}
