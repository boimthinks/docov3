/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';
import { getExpiryStatus, formatIndonesianDate } from '../utils';
import { FamilyMember, Category, Document } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_MAP } from '../constants';

interface DashboardProps {
  onCategoryClick: (categoryId: number) => void;
  onAddDocumentClick: () => void;
  onDocumentClick: (doc: Document) => void;
  onAlertClick: () => void;
  onManageFamilyClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onCategoryClick,
  onAddDocumentClick,
  onDocumentClick,
  onAlertClick,
  onManageFamilyClick,
}) => {
  const documents = useLiveQuery(() => db.documents.toArray()) || [];
  const categories = DEFAULT_CATEGORIES;
  const familyMembers = useLiveQuery(() => db.familyMembers.toArray()) || [];

  // Calculate document stats
  const stats = useMemo(() => {
    let dangerCount = 0;
    let warningCount = 0;
    let safeCount = 0;

    documents.forEach((doc) => {
      const { status } = getExpiryStatus(doc.expiry_date);
      if (status === 'danger') dangerCount++;
      else if (status === 'warning') warningCount++;
      else safeCount++;
    });

    return {
      total: documents.length,
      danger: dangerCount,
      warning: warningCount,
      safe: safeCount,
    };
  }, [documents]);

  // Map category IDs to document counts
  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    documents.forEach((doc) => {
      counts[doc.categoryId] = (counts[doc.categoryId] || 0) + 1;
    });
    return counts;
  }, [documents]);

  // Map member IDs to document counts
  const memberCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    documents.forEach((doc) => {
      counts[doc.ownerId] = (counts[doc.ownerId] || 0) + 1;
    });
    return counts;
  }, [documents]);

  // Filter documents that are expiring soonest
  const dynamicAlertDocs = useMemo(() => {
    return documents
      .filter((doc) => doc.expiry_date) // Only docs with expiry
      .map((doc) => ({
        ...doc,
        expiryInfo: getExpiryStatus(doc.expiry_date),
      }))
      .sort((a, b) => {
        const daysA = a.expiryInfo.daysRemaining ?? Infinity;
        const daysB = b.expiryInfo.daysRemaining ?? Infinity;
        return daysA - daysB;
      })
      .slice(0, 3); // Top 3 critical documents
  }, [documents]);

  // Greeting based on Indonesian local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  return (
    <div className="space-y-6 pb-24 font-sans select-none selection:bg-blue-600 animate-fade-in">
      {/* 1. Welcoming Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
        {/* Abstract background decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 text-blue-100 px-3 py-1 rounded-full backdrop-blur-sm">
              Vault Dokumen Mandiri
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">
              {greeting}, Keluarga Indonesia!
            </h2>
            <p className="text-blue-100/90 text-sm mt-1 max-w-md">
              Seluruh data dokumen Anda terenkripsi aman secara lokal di perangkat ini. Bebas awan, 100% privat.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAddDocumentClick}
              className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              id="dash-btn-add-doc"
            >
              <LucideIcon name="PlusCircle" size={18} />
              Tambah Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento Grid Status Masa Berlaku */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Status Masa Berlaku
          </h3>
          <button
            onClick={onAlertClick}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Lihat Detail Alerts <LucideIcon name="ChevronRight" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {/* Danger Card */}
          <div
            onClick={onAlertClick}
            className="bg-red-50 hover:bg-red-100/80 border border-red-100 p-4 rounded-3xl flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:shadow-md"
            id="dash-stat-danger"
          >
            <div className="flex items-center justify-between">
              <span className="text-red-600 bg-red-100/60 p-2 rounded-xl">
                <LucideIcon name="AlertTriangle" size={18} />
              </span>
              <span className="text-xs font-bold text-red-600 bg-red-100/40 px-2 py-0.5 rounded-full font-sans uppercase">
                &le; 7 Hari
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-red-700 tracking-tight block">
                {stats.danger}
              </span>
              <span className="text-xs text-red-600 font-medium block mt-0.5">Bahaya</span>
            </div>
          </div>

          {/* Warning Card */}
          <div
            onClick={onAlertClick}
            className="bg-amber-50 hover:bg-amber-100/80 border border-amber-100 p-4 rounded-3xl flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:shadow-md"
            id="dash-stat-warning"
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-600 bg-amber-100/60 p-2 rounded-xl">
                <LucideIcon name="Clock" size={18} />
              </span>
              <span className="text-xs font-bold text-amber-600 bg-amber-100/40 px-2 py-0.5 rounded-full font-sans uppercase">
                &le; 30 Hari
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-amber-700 tracking-tight block">
                {stats.warning}
              </span>
              <span className="text-xs text-amber-600 font-medium block mt-0.5">Peringatan</span>
            </div>
          </div>

          {/* Safe Card */}
          <div
            onClick={onAlertClick}
            className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 p-4 rounded-3xl flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:shadow-md"
            id="dash-stat-safe"
          >
            <div className="flex items-center justify-between">
              <span className="text-emerald-600 bg-emerald-100/60 p-2 rounded-xl">
                <LucideIcon name="Check" size={18} />
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100/40 px-2 py-0.5 rounded-full font-sans uppercase">
                Aman
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-emerald-700 tracking-tight block">
                {stats.safe}
              </span>
              <span className="text-xs text-emerald-600 font-medium block mt-0.5">Aman / Abadi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Categories Horizontal Carousel/Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Kategori Dokumen
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id!] || 0;
            return (
              <div
                key={cat.id}
                onClick={() => onCategoryClick(cat.id!)}
                className="group bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 p-4 rounded-2xl flex items-start gap-3 transition-all cursor-pointer shadow-sm"
                id={`dash-category-${cat.id}`}
              >
                <div
                  className={`p-2.5 rounded-xl transition-colors bg-white group-hover:bg-blue-100 text-blue-600`}
                >
                  <LucideIcon name={cat.icon} size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-900 line-clamp-1 leading-tight">
                    {cat.name}
                  </h4>
                  <span className="text-xs text-slate-500 group-hover:text-blue-700 block mt-1 font-mono">
                    {count} Dokumen
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Critical Expiry Alerts (Expiring Soon) */}
      {dynamicAlertDocs.length > 0 && (
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-3.5">
            <LucideIcon name="AlertCircle" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 leading-none">
              Jadwal Penting Kadaluarsa
            </h3>
          </div>

          <div className="space-y-3">
            {dynamicAlertDocs.map((doc) => {
              const days = doc.expiryInfo.daysRemaining;
              const isDanger = doc.expiryInfo.status === 'danger';
              return (
                <div
                  key={doc.id}
                  onClick={() => onDocumentClick(doc)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all cursor-pointer"
                  id={`dash-alert-doc-${doc.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isDanger ? 'bg-red-500 animate-ping' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{doc.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Habis: <span className="font-medium text-slate-700">{formatIndonesianDate(doc.expiry_date)}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isDanger
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {days && days > 0 ? `${days} Hari Lagi` : 'KADALUARSA'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Family Members Summary Panel */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LucideIcon name="Users" className="text-slate-600" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Profil Anggota Keluarga
            </h3>
          </div>
          <button
            onClick={onManageFamilyClick}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Kelola Anggota <LucideIcon name="ChevronRight" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {familyMembers.map((member) => {
            const count = memberCounts[member.id!] || 0;
            return (
              <div
                key={member.id}
                className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:border-slate-200 transition-colors"
              >
                <div
                  className={`w-10 h-10 ${member.avatarColor} text-white font-bold text-sm rounded-xl flex items-center justify-center shadow-inner`}
                >
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 truncate leading-none">
                    {member.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {member.role} • {count} Dok
                  </span>
                </div>
              </div>
            );
          })}

          <button
            onClick={onManageFamilyClick}
            className="border border-dashed border-slate-300 hover:border-blue-400 bg-white/50 hover:bg-blue-50/20 text-slate-500 hover:text-blue-600 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all"
            id="dash-btn-add-member"
          >
            <LucideIcon name="UserPlus" size={16} />
            Tambah
          </button>
        </div>
      </div>

      {/* 6. On-Device Encryption Branding Info */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-4 border border-slate-800">
        <div className="p-3 bg-slate-800 rounded-2xl text-emerald-400 border border-slate-700/50">
          <LucideIcon name="Shield" size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            100% On-Device Encryption & Privacy
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Aplikasi DOCO berjalan sepenuhnya di browser Anda. Tidak ada server cloud yang dapat melihat, menyimpan, atau menyadap foto-foto KTP, SIM, atau sertifikat keluarga Anda.
          </p>
        </div>
      </div>
    </div>
  );
};
