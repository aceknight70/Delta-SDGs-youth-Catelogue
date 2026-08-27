sed -i '17c\
  const typeStories = stories.filter((s: any) => s.story_type === type || (!s.story_type && type === '"'Story for Selection'"') || (s.story_type === '"'Short Story'"' && type === '"'Story for Selection'"'));' src/pages/ParentDashboard.tsx
