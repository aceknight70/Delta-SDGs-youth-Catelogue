sed -i '95,138d' src/pages/Catalogue.tsx

sed -i '94 a \
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\
\
      {/* HERO SECTION */}\
      <div className="flex flex-col items-center text-center mb-12 mt-4">\
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">\
          Youngster-Youth Catalogue\
        </h1>\
\
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">\
          <button\
            onClick={() => setViewMode('"'"'youngster'"'"')}\
            className={`px-8 py-3 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 ${viewMode === '"'"'youngster'"'"' ? '"'"'bg-white text-blue-700 shadow border border-gray-200'"'"' : '"'"'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"'"'}`}\
          >\
            Youngster\
          </button>\
          <button\
            onClick={() => setViewMode('"'"'youth'"'"')}\
            className={`px-8 py-3 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 ${viewMode === '"'"'youth'"'"' ? '"'"'bg-white text-teal-700 shadow border border-gray-200'"'"' : '"'"'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'"'"'}`}\
          >\
            Youth\
          </button>\
        </div>\
      </div>\
\
      {branding?.founder_note && (\
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center italic text-gray-700 text-lg mb-8">\
          "{branding.founder_note}"\
        </div>\
      )}\
\
      <div className="text-center mb-12">\
        <a href="https://sdg-summer-camp-2026-updated.vercel.app/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${theme.btnPrimary} transition-colors shadow-sm px-6 py-3 font-bold text-white rounded-xl`}>\
          <span>🚀</span> Go to the Official SDG Summer Camp 2026 App\
        </a>\
      </div>\
\
      <div className="flex flex-col gap-3 mb-10">\
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-center justify-center gap-3 border border-yellow-200 shadow-sm">\
          <span className="text-2xl">🌟</span>\
          <span className="font-semibold text-lg">{approvedCount} young innovators showcased this year</span>\
        </div>\
\
        {[\
          { type: '"'"'Descriptive Essay'"'"', icon: '"'"'📝'"'"', title: '"'"'Descriptive Essays submitted'"'"' },\
          { type: '"'"'Narrative Essay'"'"', icon: '"'"'📝'"'"', title: '"'"'Narrative Essays submitted'"'"' },\
          { type: '"'"'Story for Selection'"'"', icon: '"'"'🎬'"'"', title: '"'"'incredible stories written fit for a Nollywood Short Film presentation!'"'"' },\
          { type: '"'"'Argumentative Essay'"'"', icon: '"'"'⚖️'"'"', title: '"'"'Argumentative Essays submitted'"'"' },\
          { type: '"'"'Expository Essay'"'"', icon: '"'"'💡'"'"', title: '"'"'Expository Essays submitted'"'"' },\
          { type: '"'"'Formal Letter'"'"', icon: '"'"'✉️'"'"', title: '"'"'Formal Letters submitted'"'"' },\
          { type: '"'"'Illustration'"'"', icon: '"'"'🎨'"'"', title: '"'"'Illustrations submitted'"'"' }\
        ].map(config => {\
          const typeCount = stories.filter(s => s.is_active !== false && (s.story_type === config.type || (!s.story_type && config.type === '"'"'Story for Selection'"'"') || (s.story_type === '"'"'Short Story'"'"' && config.type === '"'"'Story for Selection'"'"'))).length;\
          if (typeCount === 0) return null;\
          return (\
            <Link key={config.type} to="/stories" className="bg-purple-50 text-purple-800 p-4 rounded-xl flex items-center justify-center gap-3 border border-purple-200 shadow-sm hover:bg-purple-100 transition-colors">\
              <span className="text-2xl">{config.icon}</span>\
              <span className="font-semibold text-lg">\
                {typeCount} {config.type === '"'"'Story for Selection'"'"' ? `incredible stor${typeCount === 1 ? '"'"'y'"'"' : '"'"'ies'"'"'} written fit for a Nollywood Short Film presentation!` : config.title} Click to read.\
              </span>\
            </Link>\
          );\
        })}\
      </div>\
\
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">\
' src/pages/Catalogue.tsx
