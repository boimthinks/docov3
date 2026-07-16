/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, seedDatabase } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ViewState, Document } from './types';

// Importing components
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { DocumentDetail } from './components/DocumentDetail';
import { AddEditDocument } from './components/AddEditDocument';
import { AlertsPage } from './components/AlertsPage';
import { MeSettings } from './components/MeSettings';
import { LockScreen } from './components/LockScreen';
import { Onboarding } from './components/Onboarding';
import { LucideIcon } from './components/LucideIcon';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Layout states
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [docToEdit, setDocToEdit] = useState<Document | null>(null);

  // Shared Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Track background resume lock state
  useEffect(() => {
    let lastActive = Date.now();

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const timeAway = Date.now() - lastActive;
        const autoLockSetting = await db.settings.get('auto_lock');
        
        // Lock if user was away for more than 60 seconds (1 minute)
        if (autoLockSetting?.value === 'true' && timeAway > 60000) {
          setIsLocked(true);
        }
      } else {
        lastActive = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initialize and Seed Database on Launch
  useEffect(() => {
    async function initApp() {
      try {
        await seedDatabase();
        
        // Check if onboarding is completed
        const setupCompleted = await db.settings.get('setup_completed');
        if (setupCompleted?.value !== 'true') {
          setIsOnboarding(true);
          setIsLocked(false); // No lock during onboarding
        } else {
          setIsLocked(true); // Lock on fresh boot
        }
        
        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize local IndexedDB: ', err);
        setInitialized(true); // Fail gracefully
      }
    }

    initApp();
  }, []);

  // Register PWA service worker locally
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('DOCO ServiceWorker registered with scope: ', registration.scope);
          })
          .catch((error) => {
            console.error('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);

  // Reset active sub-states when view changes
  const handleViewChange = (newView: ViewState) => {
    setActiveView(newView);
    setSelectedDoc(null);
    setIsAdding(false);
    setDocToEdit(null);
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setActiveView('documents');
    setSelectedDoc(null);
    setIsAdding(false);
    setDocToEdit(null);
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsAdding(false);
    setDocToEdit(null);
  };

  const handleEditClick = (doc: Document) => {
    setDocToEdit(doc);
    setIsAdding(true);
    setSelectedDoc(null);
  };

  const handleAddDocumentClick = () => {
    setDocToEdit(null);
    setIsAdding(true);
    setSelectedDoc(null);
  };

  const handleForceRelock = () => {
    setIsLocked(true);
  };

  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse border border-blue-400/20 mb-4">
          <LucideIcon name="Shield" className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-black text-white">DOCO</h1>
        <p className="text-slate-400 text-xs mt-1 animate-pulse">Menyiapkan Brankas Lokal Terenkripsi...</p>
      </div>
    );
  }

  // Onboarding Phase
  if (isOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          setIsOnboarding(false);
          setIsLocked(false);
          setActiveView('home');
        }}
      />
    );
  }

  // Lock Screen Phase
  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-600" id="doco-app-root">
      {/* Centered iPhone/Android-sized viewport container on desktop, fluid on mobile */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col justify-between shadow-2xl relative border-x border-slate-200/50 pb-20 pt-safe">
        
        {/* Header (Dynamic context) */}
        <Header
          onLock={handleForceRelock}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeView={activeView}
        />

        {/* Scrollable Main Content Section */}
        <main className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none" id="main-scroll-view">
          
          {/* Sub-view switcher based on layout states */}
          {isAdding ? (
            <AddEditDocument
              documentToEdit={docToEdit || undefined}
              onBack={() => {
                setIsAdding(false);
                setDocToEdit(null);
              }}
              onSaveSuccess={() => {
                setIsAdding(false);
                setDocToEdit(null);
                setActiveView('documents');
              }}
            />
          ) : selectedDoc ? (
            <DocumentDetail
              document={selectedDoc}
              onBack={() => setSelectedDoc(null)}
              onEditClick={handleEditClick}
              onDeleteSuccess={() => {
                setSelectedDoc(null);
                setActiveView('documents');
              }}
            />
          ) : (
            <>
              {activeView === 'home' && (
                <Dashboard
                  onCategoryClick={handleCategoryClick}
                  onAddDocumentClick={handleAddDocumentClick}
                  onDocumentClick={handleDocumentClick}
                  onAlertClick={() => handleViewChange('alerts')}
                  onManageFamilyClick={() => handleViewChange('me')}
                />
              )}

              {activeView === 'documents' && (
                <DocumentList
                  onDocumentClick={handleDocumentClick}
                  onAddDocumentClick={handleAddDocumentClick}
                  selectedCategoryId={selectedCategoryId}
                  setSelectedCategoryId={setSelectedCategoryId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}

              {activeView === 'alerts' && (
                <AlertsPage onDocumentClick={handleDocumentClick} />
              )}

              {activeView === 'me' && (
                <MeSettings onForceRelock={handleForceRelock} />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Menu (Locked to layout) */}
        <BottomNavigation
          activeView={activeView}
          setActiveView={handleViewChange}
          onAddDocumentClick={handleAddDocumentClick}
        />
      </div>
    </div>
  );
}
