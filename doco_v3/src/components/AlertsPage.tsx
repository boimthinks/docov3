/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';
import { getExpiryStatus, formatIndonesianDate } from '../utils';
import { Document, Category, FamilyMember } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_MAP } from '../constants';

interface AlertsPageProps {
  onDocumentClick: (doc: Document) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onDocumentClick }) => {
  const documents = useLiveQuery(() => db.documents.toArray()) || [];
  const categories = DEFAULT_CATEGORIES;
  const familyMembers = useLiveQuery(() => db.familyMembers.toArray()) || [];

  // Group lookup maps
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

  // Group documents by expiry status
  const groupedDocs = useMemo(() => {
    const danger: Array<Document & { days: number | null }> = [];
    const warning: Array<Document & { days: number | null }> = [];
    const safe: Array<Document & { days: number | null }> = [];

    documents.forEach((doc) => {
      const { status, daysRemaining } = getExpiryStatus(doc.expiry_date);
      const docWithDays = { ...doc, days: daysRemaining };

      if (status === 'danger') {
        danger.push(docWithDays);
      } else if (status === 'warning') {
        warning.push(docWithDays);
      } else {
        safe.push(docWithDays);
      }
    });

    // Sort by days remaining (lowest first, null/lifetime last)
    const sortByDays = (a: any, b: any) => {
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    };

    return {
      danger: danger.sort(sortByDays),
      warning: warning.sort(sortByDays),
      safe: safe.sort(sortByDays),
    };
  }, [documents]);

  return (
    <div className="space-y-6 pb-24 font-sans select-none selection:bg-blue-600 animate-fade-in">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status & Alerts</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Pantau masa berlaku semua dokumen keluarga</p>
      </div>

      {/* 2. Visual Status Progress Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rasio Masa Berlaku</h3>
        
        {documents.length > 0 ? (
          <div className="space-y-2">
            <div className="flex h-3.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${(groupedDocs.danger.length / documents.length) * 100}%` }}
                className="bg-red-500 transition-all duration-300"
                title={`Bahaya: ${groupedDocs.danger.length}`}
              />
              <div
                style={{ width: `${(groupedDocs.warning.length / documents.length) * 100}%` }}
                className="bg-amber-500 transition-all duration-300"
                title={`Peringatan: ${groupedDocs.warning.length}`}
              />
              <div
                style={{ width: `${(groupedDocs.safe.length / documents.length) * 100}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Aman: ${groupedDocs.safe.length}`}
              />
            </div>

            {/* Labels under bar */}
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 font-bold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Bahaya ({groupedDocs.danger.length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Peringatan ({groupedDocs.warning.length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Aman ({groupedDocs.safe.length})
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Tidak ada dokumen untuk dianalisis.</p>
        )}
      </div>

      {/* 3. Alerts Section (Bahaya - Red) */}
      {groupedDocs.danger.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-red-600 font-bold px-1 text-sm uppercase tracking-wider">
            <LucideIcon name="AlertTriangle" size={16} />
            <h4>Bahaya (&le; 7 Hari)</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedDocs.danger.map((doc) => {
              const cat = categoriesMap[doc.categoryId];
              const owner = membersMap[doc.ownerId];
              return (
                <div
                  key={doc.id}
                  onClick={() => onDocumentClick(doc)}
                  className="bg-red-50/50 hover:bg-red-50 hover:border-red-300 border border-red-100/80 rounded-2xl p-4 cursor-pointer transition-all flex justify-between items-center gap-4"
                  id={`alert-danger-doc-${doc.id}`}
                >
                  <div className="space-y-1.5 overflow-hidden">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600/70 uppercase">
                      <LucideIcon name={cat?.icon || 'FileText'} size={12} />
                      {cat?.name.split(' (')[0]}
                    </span>
                    <h5 className="text-sm font-extrabold text-red-950 truncate">{doc.title}</h5>
                    <p className="text-xs text-red-700 font-medium">
                      Habis: {formatIndonesianDate(doc.expiry_date)}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-slate-600 bg-white/80 border border-red-200 px-2 py-0.5 rounded-full mt-1">
                      Milik: {owner?.name}
                    </span>
                  </div>

                  <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shrink-0 text-center shadow-md shadow-red-500/10">
                    {doc.days !== null && doc.days <= 0
                      ? 'KADALUARSA'
                      : `${doc.days} Hari`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Alerts Section (Peringatan - Yellow) */}
      {groupedDocs.warning.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-amber-600 font-bold px-1 text-sm uppercase tracking-wider">
            <LucideIcon name="Clock" size={16} />
            <h4>Peringatan (&le; 30 Hari)</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedDocs.warning.map((doc) => {
              const cat = categoriesMap[doc.categoryId];
              const owner = membersMap[doc.ownerId];
              return (
                <div
                  key={doc.id}
                  onClick={() => onDocumentClick(doc)}
                  className="bg-amber-50/30 hover:bg-amber-50 hover:border-amber-300 border border-amber-100 rounded-2xl p-4 cursor-pointer transition-all flex justify-between items-center gap-4"
                  id={`alert-warning-doc-${doc.id}`}
                >
                  <div className="space-y-1.5 overflow-hidden">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase">
                      <LucideIcon name={cat?.icon || 'FileText'} size={12} />
                      {cat?.name.split(' (')[0]}
                    </span>
                    <h5 className="text-sm font-extrabold text-amber-950 truncate">{doc.title}</h5>
                    <p className="text-xs text-amber-700 font-medium">
                      Habis: {formatIndonesianDate(doc.expiry_date)}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-slate-600 bg-white border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                      Milik: {owner?.name}
                    </span>
                  </div>

                  <span className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shrink-0 text-center shadow-md shadow-amber-500/10">
                    {doc.days} Hari
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Safe Section (Aman - Green/Slate) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold px-1 text-sm uppercase tracking-wider">
          <LucideIcon name="Check" size={16} />
          <h4>Aman / Abadi</h4>
        </div>

        {groupedDocs.safe.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedDocs.safe.map((doc) => {
              const cat = categoriesMap[doc.categoryId];
              const owner = membersMap[doc.ownerId];
              return (
                <div
                  key={doc.id}
                  onClick={() => onDocumentClick(doc)}
                  className="bg-white hover:bg-slate-50 hover:border-slate-300 border border-slate-150 rounded-2xl p-4 cursor-pointer transition-all flex justify-between items-center gap-4"
                  id={`alert-safe-doc-${doc.id}`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <LucideIcon name={cat?.icon || 'FileText'} size={12} />
                      {cat?.name.split(' (')[0]}
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 truncate">{doc.title}</h5>
                    <p className="text-[10px] text-slate-500">
                      Masa Berlaku: <span className="font-semibold">{doc.expiry_date ? formatIndonesianDate(doc.expiry_date) : 'Seumur Hidup'}</span>
                    </p>
                    <span className="inline-block text-[9px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md mt-1">
                      Milik: {owner?.name}
                    </span>
                  </div>

                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[10px] px-2.5 py-1 rounded-full shrink-0">
                    Aman
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic px-1">Tidak ada berkas berstatus aman.</p>
        )}
      </div>

      {/* 6. Indonesian renewal guides */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5 space-y-3.5">
        <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <LucideIcon name="Info" size={16} />
          Panduan Perpanjangan Dokumen di Indonesia
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700">
          <div className="space-y-1">
            <h5 className="font-bold text-blue-800">1. SIM (Surat Izin Mengemudi)</h5>
            <p className="text-[11px] text-slate-600">
              Masa berlaku SIM adalah 5 tahun sejak tanggal penerbitan. Perpanjangan harus diajukan sebelum habis masa berlaku di Gerai SIM Keliling, Satpas Polres setempat, atau aplikasi online SINAR. Jika lewat 1 hari saja, Anda wajib membuat SIM baru dari awal.
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-blue-800">2. KTP & Kartu Keluarga (KK)</h5>
            <p className="text-[11px] text-slate-600">
              KTP-el berlaku seumur hidup sejak UU No. 24 Tahun 2013, Anda tidak perlu memperpanjangnya lagi kecuali mengubah data diri, rusak, atau hilang. KK versi digital terbaru tidak ada masa kadaluarsa dan dilengkapi kode QR (Tanda Tangan Elektronik).
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-blue-800">3. Paspor Indonesia</h5>
            <p className="text-[11px] text-slate-600">
              Paspor Indonesia keluaran terbaru memiliki masa berlaku 10 tahun (bagi usia &ge; 17 tahun). Perpanjangan disarankan dilakukan minimal 6 bulan sebelum masa berlaku berakhir karena banyak imigrasi negara lain mewajibkan syarat minimal sisa 6 bulan paspor aktif.
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-blue-800">4. Sertifikat Tanah / Rumah (SHM)</h5>
            <p className="text-[11px] text-slate-600">
              Sertifikat Hak Milik (SHM) berlaku selamanya dan merupakan bukti kepemilikan terkuat. Sebaiknya simpan salinan digital (scan) di DOCO dan simpan dokumen fisik asli di Safe Deposit Box (SDB) bank atau brankas anti-api di rumah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
