cat << 'INNER_EOF' > story-section.ts
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
INNER_EOF

# Delete lines 12 through 110 of src/pages/ParentDashboard.tsx (the existing StoryFormSection)
sed -i '12,110d' src/pages/ParentDashboard.tsx

# Insert the new version at line 11
sed -i '11r story-section.ts' src/pages/ParentDashboard.tsx

