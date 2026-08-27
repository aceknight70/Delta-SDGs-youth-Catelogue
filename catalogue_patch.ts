const typeConfigs = [
  { type: 'Descriptive Essay', icon: '📝', title: 'Descriptive Essays submitted' },
  { type: 'Narrative Essay', icon: '📝', title: 'Narrative Essays submitted' },
  { type: 'Story for Selection', icon: '📖', title: 'incredible stories written fit for a Nollywood Short Film presentation!' },
  { type: 'Argumentative Essay', icon: '⚖️', title: 'Argumentative Essays submitted' },
  { type: 'Expository Essay', icon: '💡', title: 'Expository Essays submitted' },
  { type: 'Formal Letter', icon: '✉️', title: 'Formal Letters submitted' },
  { type: 'Illustration', icon: '🎨', title: 'Illustrations submitted' }
];

// Inside the render of Catalogue.tsx
        {typeConfigs.map(config => {
          const typeCount = stories.filter(s => s.is_active !== false && (s.story_type === config.type || (!s.story_type && config.type === 'Story for Selection'))).length;
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
