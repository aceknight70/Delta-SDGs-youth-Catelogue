import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branding, Participant } from '../types';
import { db } from '../lib/db';

interface AppContextType {
  branding: Branding | null;
  refreshBranding: () => Promise<void>;
  loggedInParent: Participant | null;
  loginParent: (pin: string) => Promise<boolean>;
  logoutParent: () => void;
  isLoading: boolean;
  forceLoginAs: (id: number) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loggedInParent, setLoggedInParent] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBranding = async () => {
    const data = await db.getBranding();
    setBranding(data);
  };

  useEffect(() => {
    const init = async () => {
      await refreshBranding();
      // Check local storage for session
      const storedId = localStorage.getItem('youth_catalog_parent_session');
      if (storedId) {
        const participant = await db.getParticipant(parseInt(storedId, 10));
        if (participant) setLoggedInParent(participant);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const loginParent = async (pin: string) => {
    const participants = await db.getParticipants();
    const found = participants.find(p => p.participant_access_pin === pin && p.application_status === 'Approved');
    if (found) {
      setLoggedInParent(found);
      localStorage.setItem('youth_catalog_parent_session', found.id.toString());
      return true;
    }
    return false;
  };
  
  // For Staff preview
  const forceLoginAs = async (id: number) => {
    const participant = await db.getParticipant(id);
    if (participant) {
      setLoggedInParent(participant);
      localStorage.setItem('youth_catalog_parent_session', participant.id.toString());
      return true;
    }
    return false;
  };

  const logoutParent = () => {
    setLoggedInParent(null);
    localStorage.removeItem('youth_catalog_parent_session');
  };

  return (
    <AppContext.Provider value={{ branding, refreshBranding, loggedInParent, loginParent, logoutParent, isLoading, forceLoginAs } as any}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
