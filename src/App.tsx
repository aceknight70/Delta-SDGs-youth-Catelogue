/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';

import Header from './components/Header';
import Footer from './components/Footer';
import JoinNextCohort from './components/JoinNextCohort';

import Catalogue from './pages/Catalogue';
import ChildProfile from './pages/ChildProfile';
import StoriesRoom from './pages/StoriesRoom';
import ParentLogin from './pages/ParentLogin';
import ParentDashboard from './pages/ParentDashboard';
import StaffRoom from './pages/StaffRoom';
import Gallery from './pages/Gallery';
import VideoGallery from './pages/VideoGallery';
import Registration from './pages/Registration';

// Override alert to prevent iframe errors and show a simple UI fallback
const originalAlert = window.alert;
window.alert = (msg) => {
  console.log('Alert called:', msg);
  // Create a temporary div to show the alert message
  const alertDiv = document.createElement('div');
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.backgroundColor = '#1e3a8a'; // blue-900
  alertDiv.style.color = '#ffffff';
  alertDiv.style.padding = '12px 24px';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  alertDiv.style.fontWeight = '500';
  alertDiv.textContent = msg;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      if (document.body.contains(alertDiv)) {
        document.body.removeChild(alertDiv);
      }
    }, 500);
  }, 3000);
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans text-gray-900">
          <Header />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Catalogue />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/child/:id" element={<ChildProfile />} />
              <Route path="/stories" element={<StoriesRoom />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/video-gallery" element={<VideoGallery />} />
              <Route path="/login" element={<ParentLogin />} />
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
              <Route path="/staff" element={<StaffRoom />} />
            </Routes>
            <div className="px-4">
              <JoinNextCohort />
            </div>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

