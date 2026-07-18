/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from './LucideIcon';
import { ViewState } from '../types';

interface BottomNavigationProps {
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  onAddDocumentClick: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeView,
  setActiveView,
  onAddDocumentClick,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-2 pb-safe z-40 flex items-center justify-around md:justify-center md:gap-16 font-sans">
      {/* Home Button */}
      <button
        onClick={() => setActiveView('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] rounded-2xl transition-all cursor-pointer ${
          activeView === 'home'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        id="nav-btn-home"
      >
        <div
          className={`px-4 py-1 rounded-full transition-all ${
            activeView === 'home' ? 'bg-blue-50' : 'bg-transparent'
          }`}
        >
          <LucideIcon name="Home" size={20} />
        </div>
        <span className="text-[10px] tracking-tight">Dashboard</span>
      </button>

      {/* Documents Button */}
      <button
        onClick={() => setActiveView('documents')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] rounded-2xl transition-all cursor-pointer ${
          activeView === 'documents'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        id="nav-btn-documents"
      >
        <div
          className={`px-4 py-1 rounded-full transition-all ${
            activeView === 'documents' ? 'bg-blue-50' : 'bg-transparent'
          }`}
        >
          <LucideIcon name="FileText" size={20} />
        </div>
        <span className="text-[10px] tracking-tight">Dokumen</span>
      </button>

      {/* Center Floating Action Button (+) */}
      <div className="relative -top-4">
        <button
          onClick={onAddDocumentClick}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white"
          title="Tambah Dokumen Baru"
          id="nav-btn-add"
        >
          <LucideIcon name="Plus" size={28} />
        </button>
      </div>

      {/* Alerts/Reminder Button */}
      <button
        onClick={() => setActiveView('alerts')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] rounded-2xl transition-all cursor-pointer ${
          activeView === 'alerts'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        id="nav-btn-alerts"
      >
        <div
          className={`px-4 py-1 rounded-full transition-all ${
            activeView === 'alerts' ? 'bg-blue-50' : 'bg-transparent'
          }`}
        >
          <LucideIcon name="AlertCircle" size={20} />
        </div>
        <span className="text-[10px] tracking-tight">Status</span>
      </button>

      {/* Me Button (Family & Settings) */}
      <button
        onClick={() => setActiveView('me')}
        className={`flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] rounded-2xl transition-all cursor-pointer ${
          activeView === 'me'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        id="nav-btn-me"
      >
        <div
          className={`px-4 py-1 rounded-full transition-all ${
            activeView === 'me' ? 'bg-blue-50' : 'bg-transparent'
          }`}
        >
          <LucideIcon name="User" size={20} />
        </div>
        <span className="text-[10px] tracking-tight">Saya</span>
      </button>
    </div>
  );
};
