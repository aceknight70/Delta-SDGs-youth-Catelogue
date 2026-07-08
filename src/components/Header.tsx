import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Search, Users, LogIn } from 'lucide-react';

export default function Header() {
  const { branding, loggedInParent } = useAppContext();

  if (!branding) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to="/" className="flex-shrink-0">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="h-[60px] w-auto max-w-[120px] object-contain rounded" />
              ) : (
                <div className="w-[60px] h-[60px] bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-400">
                  🌟
                </div>
              )}
            </Link>
            
            <div className="flex flex-col">
              <Link to="/" className="text-xl font-bold text-gray-900 leading-tight">
                {branding.main_title}
              </Link>
              <span className="text-sm font-medium text-blue-600">{branding.subtitle}</span>
              <span className="text-xs text-gray-500 italic mt-0.5">"{branding.tagline}"</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Search className="w-4 h-4" />
              Directory
            </Link>
            <Link to="/register" className="text-gray-600 hover:text-blue-600 transition-colors">
              Register Child
            </Link>
            <Link to="/gallery" className="text-gray-600 hover:text-blue-600 transition-colors">
              Gallery
            </Link>
            <Link to="/video-gallery" className="text-gray-600 hover:text-blue-600 transition-colors">
              Videos
            </Link>
            <Link to="/stories" className="text-gray-600 hover:text-blue-600 transition-colors">
              Stories
            </Link>
            <Link to="/staff" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Users className="w-4 h-4" />
              Staff
            </Link>
            {loggedInParent ? (
              <Link to="/parent-dashboard" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2">
                👪 Parent Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <LogIn className="w-4 h-4" />
                Parent Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
