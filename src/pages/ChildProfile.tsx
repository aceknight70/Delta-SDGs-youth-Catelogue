import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { Participant, Creation, Story } from '../types';
import ScrollableTextBox from '../components/ScrollableTextBox';
import { ArrowLeft, MapPin, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ChildProfile() {
  const { id } = useParams<{ id: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  const [showInterestForm, setShowInterestForm] = useState(false);
  const [interestForm, setInterestForm] = useState({
    parent_name: '', child_name: '', child_age: '', location: '', phone_whatsapp: '', email: '', supporting_organization: ''
  });
  const [submittingInterest, setSubmittingInterest] = useState(false);

  const [cheering, setCheering] = useState(false);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectForm, setConnectForm] = useState({ name: '', contact: '', message: '' });
  const [submittingConnect, setSubmittingConnect] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const pId = parseInt(id, 10);
        const p = await db.getParticipant(pId);
        // Only allow public access if approved and has consent
        if (p && p.application_status === 'Approved' && p.guardian_consent) {
          setParticipant(p);
          const c = await db.getCreationsByParticipant(pId);
          setCreations(c.sort((a,b) => a.display_order - b.display_order));
          const s = await db.getStoriesByParticipant(pId);
          setStories(s.sort((a,b) => a.display_order - b.display_order));
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current || !participant) return;
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${participant.first_name}_Certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate certificate', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const handleCheer = async () => {
    if (!participant || cheering) return;
    setCheering(true);
    try {
      await db.incrementCheer(participant.id);
      setParticipant({ ...participant, cheer_count: (participant.cheer_count || 0) + 1 });
    } catch (err) {
      console.error(err);
    }
    setCheering(false);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;
    setSubmittingConnect(true);
    try {
      await db.saveConnectionRequest({
        participant_id: participant.id,
        requester_name: connectForm.name,
        requester_contact: connectForm.contact,
        message: connectForm.message,
        status: 'Pending'
      });
      alert('Request sent. Staff will review and forward it if appropriate.');
      setShowConnectForm(false);
      setConnectForm({ name: '', contact: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to send request.');
    }
    setSubmittingConnect(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!participant) return <div className="text-center py-20 text-red-500">Innovator not found or not public.</div>;

  const canShowVideo = (url: string | null) => {
    if (!url) return false;
    if (participant.attendance_type === 'Remote') return true; 
    if (participant.attendance_type === 'Physical' && participant.guardian_consent) return true;
    return false;
  };

  const mainProjectTitle = creations.length > 0 ? creations[0].project_title : "Innovation Project";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalogue
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        {/* Top Section: Story and Parent Quote */}
        <div className="p-8 sm:p-10 bg-yellow-50/50">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">In Their Own Words</h2>
                <div className="text-xl text-gray-800 font-medium italic leading-relaxed">
                  "{participant.story || 'I am excited to share my creations with the world!'}"
                </div>
              </div>

              {participant.parent_quote && (
                <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm flex items-start gap-4 mt-6">
                  {participant.parent_photo_url && (
                    <img src={participant.parent_photo_url} alt="Parent" className="w-16 h-16 rounded-full object-cover shadow-sm flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">A Word from the Family</h3>
                    <p className="text-gray-700">"{participant.parent_quote}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="border-t border-gray-100 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-6 bg-white">
           <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
             {(participant.attendance_type === 'Physical' && participant.guardian_consent && participant.participant_photo_url) ? (
               <img src={participant.participant_photo_url} alt={participant.first_name} className="w-full h-full object-cover" />
             ) : (
               <span className="text-5xl">🧒</span>
             )}
           </div>
           <div className="text-center md:text-left flex-1">
             <h1 className="text-4xl font-bold text-gray-900 mb-2">{participant.first_name}</h1>
             <div className="flex items-center justify-center md:justify-start text-gray-500 text-lg mb-4">
               <span>{participant.age} years old</span>
               <span className="mx-3">•</span>
               <MapPin className="w-5 h-5 mr-1" />
               <span>{participant.location_area}</span>
             </div>

             {(participant.sdg_goal_focus || participant.supported_by) && (
               <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
                 {participant.sdg_goal_focus && (
                   <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                     SDG: {participant.sdg_goal_focus}
                   </span>
                 )}
                 {participant.supported_by && (
                   <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                     Supported by: {participant.supported_by}
                   </span>
                 )}
               </div>
             )}
             
             <button onClick={handleDownloadCertificate} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
               <Download className="w-4 h-4" /> Download Certificate
             </button>
             
             <div className="flex gap-4 mt-6 justify-center md:justify-start">
               <button 
                 onClick={handleCheer} 
                 disabled={cheering}
                 className="flex items-center gap-2 bg-pink-50 text-pink-600 font-medium px-4 py-2 rounded-lg hover:bg-pink-100 transition-colors"
               >
                 <span>❤️</span> Cheer {participant.cheer_count ? `(${participant.cheer_count})` : ''}
               </button>
               <button 
                 onClick={() => setShowConnectForm(true)}
                 className="flex items-center gap-2 bg-indigo-50 text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
               >
                 <span>🤝</span> Want to Follow This Family?
               </button>
             </div>

             {showConnectForm && (
               <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200 text-left">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Connection Request</h3>
                 <p className="text-sm text-gray-600 mb-4">Staff will review your request and ask the family if they are comfortable connecting. No direct connection is made automatically.</p>
                 <form onSubmit={handleConnectSubmit} className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                     <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={connectForm.name} onChange={e => setConnectForm({...connectForm, name: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info (Email or Phone)</label>
                     <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={connectForm.contact} onChange={e => setConnectForm({...connectForm, contact: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Short Message (Optional)</label>
                     <textarea className="w-full px-3 py-2 border rounded-lg" rows={2} value={connectForm.message} onChange={e => setConnectForm({...connectForm, message: e.target.value})}></textarea>
                   </div>
                   <div className="flex gap-3">
                     <button type="submit" disabled={submittingConnect} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                       {submittingConnect ? 'Sending...' : 'Send Request'}
                     </button>
                     <button type="button" onClick={() => setShowConnectForm(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium">Cancel</button>
                   </div>
                 </form>
               </div>
             )}
           </div>
        </div>
      </div>

      {creations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Project Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                <a href={c.image_url!} target="_blank" rel="noopener noreferrer" className="h-48 bg-gray-100 group relative block">
                  {c.image_url ? (
                    <>
                      <img src={c.image_url} alt={c.project_title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-900 px-3 py-1 rounded text-sm font-medium shadow-sm transition-opacity">Click to enlarge</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </a>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{c.project_title}</h3>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block self-start mb-3">{c.project_category}</span>
                  {c.description && <p className="text-sm text-gray-600 line-clamp-4">{c.description}</p>}
                  
                  {canShowVideo(c.video_url) && c.video_url && (
                    <a href={c.video_url} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                      <span>🎥</span> Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stories.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Their Stories</h2>
          <div className="grid grid-cols-1 gap-6">
            {stories.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="font-bold text-2xl text-gray-900">{s.title}</h3>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wider">{s.story_type}</span>
                </div>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                  {s.written_text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Removed duplicate Join Next Cohort section as it's now in App.tsx globally */}

      {/* Hidden Certificate Template for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={certificateRef} className="w-[800px] h-[600px] bg-white border-[16px] border-blue-900 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <h3 className="text-2xl font-bold text-blue-900 uppercase tracking-[0.2em] mb-4">Certificate of Recognition</h3>
           <p className="text-lg text-gray-600 mb-8">This proudly certifies that</p>
           <h1 className="text-6xl font-bold text-gray-900 mb-6 font-serif">{participant.first_name}</h1>
           <p className="text-xl text-gray-700 max-w-lg mx-auto mb-12">
             Has successfully showcased their innovation <br/> <strong className="text-blue-900">"{mainProjectTitle}"</strong>
           </p>
           <div className="mt-auto border-t-2 border-gray-200 pt-6 w-full flex justify-between items-end px-12">
             <div className="text-left">
               <p className="font-bold text-gray-900">Delta SDGs Youngsters</p>
               <p className="text-sm text-gray-500">Youth Catalogue 2026</p>
             </div>
             <div className="text-right">
               <p className="text-4xl">🌟</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
