/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';
import { getExpiryStatus, formatIndonesianDate } from '../utils';
import { FamilyMember, Category, Document } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_MAP } from '../constants';

interface DocumentListProps {
  onDocumentClick: (doc: Document) => void;
  onAddDocumentClick: () => void;
  selectedCategoryId?: number;
  setSelectedCategoryId: (id?: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onDocumentClick,
  onAddDocumentClick,
  selectedCategoryId,
  setSelectedCategoryId,
  searchQuery,
  setSearchQuery,
}) => {
  const documents = useLiveQuery(() => db.documents.toArray()) || [];
  const categories = DEFAULT_CATEGORIES;
  const familyMembers = useLiveQuery(() => db.familyMembers.toArray()) || [];

  // Filter state
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'danger' | 'warning' | 'safe'>('all');

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategoryId(undefined);
    setSelectedOwnerId(undefined);
    setSelectedStatus('all');
    setSearchQuery('');
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Search Query (Matches title, number, location, note)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesNumber = doc.number.toLowerCase().includes(query);
        const matchesLocation = doc.location.toLowerCase().includes(query);
        const matchesNote = doc.note?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesNumber && !matchesLocation && !matchesNote) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategoryId !== undefined && doc.categoryId !== selectedCategoryId) {
        return false;
      }

      // 3. Owner Filter
      if (selectedOwnerId !== undefined && doc.ownerId !== selectedOwnerId) {
        return false;
      }

      // 4. Expiry Status Filter
      if (selectedStatus !== 'all') {
        const { status } = getExpiryStatus(doc.expiry_date);
        if (status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [documents, searchQuery, selectedCategoryId, selectedOwnerId, selectedStatus]);

  // Map of categories and members for lookup
  const categoriesMap = useMemo(() => {
    const map: Record<number, Category> = {};
    categories.forEach((c) => {
      if (c.id) map[c.id] = c;
    });
    return map;
  }, [categories]);

  const membersMap = useMemo(() => {
    const map: Record<number, FamilyMember> = {};
    familyMembers.forEach((m) => {
      if (m.id) map[m.id] = m;
    });
    return map;
  }, [familyMembers]);

  return (
    <div className="space-y-5 pb-24 font-sans select-none selection:bg-blue-600 animate-fade-in">
      {/* 1. Header with search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dokumen Saya</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola dan telusuri arsip berkas keluarga Anda</p>
        </div>
        <button
          onClick={onAddDocumentClick}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95"
          id="doclist-btn-add"
        >
          <LucideIcon name="Plus" size={16} />
          Tambah Dokumen
        </button>
      </div>

      {/* 2. Filter & Search Panel (Mobile Search + Pill Controls) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-4">
        {/* Search box for mobile, always visible */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <LucideIcon name="Search" size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari judul, nomor dokumen, NIK, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            id="doclist-search-mobile"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <LucideIcon name="X" size={14} />
            </button>
          )}
        </div>

        {/* Scrollable Horizontal Category Filters */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Filter Kategori
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId(undefined)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer border ${
                selectedCategoryId === undefined
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                  selectedCategoryId === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LucideIcon name={cat.icon} size={14} />
                {cat.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Horizontal Family Member Filters */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Filter Anggota Keluarga
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
            <button
              onClick={() => setSelectedOwnerId(undefined)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer border ${
                selectedOwnerId === undefined
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Keluarga
            </button>
            {familyMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedOwnerId(member.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                  selectedOwnerId === member.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${member.avatarColor}`} />
                {member.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-1">
            {(['all', 'danger', 'warning', 'safe'] as const).map((status) => {
              const label =
                status === 'all'
                  ? 'Semua Status'
                  : status === 'danger'
                  ? 'Bahaya (≤7 Hari)'
                  : status === 'warning'
                  ? 'Peringatan (≤30 Hari)'
                  : 'Aman / Abadi';
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
                    selectedStatus === status
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-100/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Clear filters trigger */}
          {(selectedCategoryId !== undefined ||
            selectedOwnerId !== undefined ||
            selectedStatus !== 'all' ||
            searchQuery !== '') && (
            <button
              onClick={handleClearFilters}
              className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <LucideIcon name="RefreshCw" size={12} />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 3. Document Count Display */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
        <span>Menampilkan {filteredDocs.length} dokumen</span>
        {selectedCategoryId !== undefined && (
          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-sans border border-blue-100">
            Kategori: {categoriesMap[selectedCategoryId]?.name.split(' (')[0]}
          </span>
        )}
      </div>

      {/* 4. Document Cards List */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const cat = categoriesMap[doc.categoryId];
            const owner = membersMap[doc.ownerId];
            const expiryInfo = getExpiryStatus(doc.expiry_date);

            return (
              <div
                key={doc.id}
                onClick={() => onDocumentClick(doc)}
                className="bg-white border border-slate-150 hover:border-blue-200 rounded-3xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] relative group"
                id={`doclist-card-${doc.id}`}
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {/* Category Label */}
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 tracking-wide uppercase">
                      <LucideIcon name={cat?.icon || 'FileText'} size={12} />
                      {cat?.name.split(' (')[0]}
                    </span>

                    {/* Expiry Badge */}
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${expiryInfo.colorClass} ${expiryInfo.borderClass}`}
                    >
                      {expiryInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>

                  {/* Document Number / NIK */}
                  <div className="flex items-center gap-1 text-xs font-mono text-slate-500 mt-1.5 bg-slate-50 px-2 py-1 rounded-lg w-fit border border-slate-100">
                    <LucideIcon name="Key" size={12} className="text-slate-400" />
                    <span>No: {doc.number || '-'}</span>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-500">
                  {/* Owner Label */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${owner?.avatarColor || 'bg-slate-400'}`} />
                    <span className="font-semibold text-slate-700">{owner?.name || 'Umum'}</span>
                  </div>

                  {/* Physical Location */}
                  {doc.location && (
                    <div className="flex items-center gap-1 text-slate-500 max-w-[150px] truncate">
                      <LucideIcon name="MapPin" size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{doc.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400">
            <LucideIcon name="FileText" size={28} />
          </div>
          <div className="max-w-xs space-y-1">
            <h3 className="text-base font-bold text-slate-800">Tidak Ada Dokumen</h3>
            <p className="text-xs text-slate-500">
              Tidak ada berkas yang cocok dengan filter atau kata kunci pencarian Anda.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Reset Filter
            </button>
            <button
              onClick={onAddDocumentClick}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all"
            >
              Tambah Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
