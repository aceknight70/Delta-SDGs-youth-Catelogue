sed -i 's/if (p.sdg_goal_focus.toLowerCase().includes('"'"'sdg'"'"'))/if (String(p.sdg_goal_focus).toLowerCase().includes('"'"'sdg'"'"'))/' src/pages/Catalogue.tsx

sed -i 's/ring: "${theme.ring}",/ring: "focus:ring-blue-500",/' src/pages/Catalogue.tsx
sed -i 's/textAccent: "${theme.textSubtitle}",/textAccent: "text-blue-700",/' src/pages/Catalogue.tsx
sed -i 's/textMuted: "${theme.textMuted}",/textMuted: "text-blue-200",/' src/pages/Catalogue.tsx
sed -i 's/bgDark: "${theme.bgDark}",/bgDark: "bg-blue-900",/' src/pages/Catalogue.tsx
sed -i 's/textSubtitle: "${theme.textSubtitle}",/textSubtitle: "text-blue-700",/' src/pages/Catalogue.tsx
