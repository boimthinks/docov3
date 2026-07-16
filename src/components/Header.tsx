/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from './LucideIcon';

interface HeaderProps {
  onLock: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLock,
  searchQuery,
  setSearchQuery,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-4 font-sans selection:bg-blue-600">
      <div className="flex items-center gap-3">
        <img src="/assets/logo-64.png" alt="DOCO" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">DOCO</h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">LOOCA APPS</p>
        </div>
      </div>

      {/* Dynamic Search Input if on document list */}
      {activeView === 'documents' && (
        <div className="flex-1 max-w-md hidden sm:block relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <LucideIcon name="Search" size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari nama dokumen, NIK, lokasi, catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            id="header-search-input"
          />
        </div>
      )}

      {/* Security and Privacy Badges */}
      <div className="flex items-center gap-2">
        <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          On-Device Privacy
        </span>

        {/* Lock button */}
        <button
          onClick={onLock}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-100 hover:border-slate-200"
          title="Kunci Aplikasi Sekarang"
          id="btn-manual-lock"
        >
          <LucideIcon name="Lock" size={18} />
        </button>
      </div>
    </header>
  );
};
