/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';
import { getExpiryStatus, formatIndonesianDate } from '../utils';
import { Document } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_MAP } from '../constants';
import { ConfirmModal } from './ConfirmModal';

interface DocumentDetailProps {
  document: Document;
  onBack: () => void;
  onEditClick: (doc: Document) => void;
  onDeleteSuccess: () => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document: doc,
  onBack,
  onEditClick,
  onDeleteSuccess,
}) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [showSecretNumber, setShowSecretNumber] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch category and owner
  const category = useLiveQuery(() => CATEGORY_MAP[doc.categoryId]);
  const owner = useLiveQuery(() => db.familyMembers.get(doc.ownerId));

  const expiryInfo = getExpiryStatus(doc.expiry_date);

  // Delete handler
  const handleDelete = async () => {
    if (doc.id) {
      await db.documents.delete(doc.id);
      onDeleteSuccess();
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans select-none selection:bg-blue-600 animate-fade-in">
      {/* 1. Detail Navigation & Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 relative z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          id="detail-btn-back"
        >
          <LucideIcon name="ChevronLeft" size={14} />
          Kembali
        </button>

        <div className="flex items-center gap-2 relative z-10 pointer-events-auto">
          {/* Edit */}
          <button
            onClick={() => onEditClick(doc)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold pointer-events-auto"
            id="detail-btn-edit"
          >
            <LucideIcon name="Edit" size={14} />
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold pointer-events-auto"
            id="detail-btn-delete"
          >
            <LucideIcon name="Trash2" size={14} />
            Hapus
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Hapus Dokumen ini?"
          message={`Apakah Anda yakin ingin menghapus dokumen "${doc.title}"? Tindakan ini tidak dapat dibatalkan secara lokal.`}
          confirmText="Hapus Permanen"
          cancelText="Batal"
          type="danger"
        />
      )}

      {/* 2. Main Visual Banner / Document Snapshot Card */}
      <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase font-bold tracking-wider">
              <LucideIcon name={category?.icon || 'FileText'} size={14} className="text-slate-400" />
              <span>{category?.name || 'Kategori Umum'}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 leading-tight">
              {doc.title}
            </h2>
          </div>

          <span
            className={`text-xs font-black px-3 py-1 rounded-full uppercase border ${expiryInfo.colorClass} ${expiryInfo.borderClass}`}
          >
            {expiryInfo.label}
          </span>
        </div>

        {/* Info Grid (Owner, Expiry date, Location, Note) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Owner Profile */}
          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div
              className={`w-10 h-10 ${owner?.avatarColor || 'bg-slate-400'} text-white font-bold text-sm rounded-xl flex items-center justify-center`}
            >
              {owner?.name.substring(0, 2).toUpperCase() || 'UM'}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pemilik Dokumen</span>
              <span className="text-sm font-bold text-slate-800">{owner?.name || 'Umum'}</span>
              <span className="text-xs text-slate-500 block font-sans">Role: {owner?.role || 'Lainnya'}</span>
            </div>
          </div>

          {/* Document Number (Toggle Hide/Show NIK) */}
          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Nomor Registrasi / NIK
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-sm font-bold font-mono text-slate-800 break-all select-text">
                {showSecretNumber ? doc.number || '-' : '• • • • • • • • • • • • • • • •'}
              </span>
              <button
                onClick={() => setShowSecretNumber(!showSecretNumber)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title={showSecretNumber ? 'Sembunyikan Nomor' : 'Tampilkan Nomor'}
              >
                <LucideIcon name={showSecretNumber ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>

          {/* Issue & Expiry Dates */}
          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tanggal Terbit</span>
              <span className="text-xs font-bold text-slate-800">
                {doc.issue_date ? formatIndonesianDate(doc.issue_date) : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Masa Berlaku</span>
              <span
                className={`text-xs font-bold ${
                  expiryInfo.status === 'danger' ? 'text-red-600' : 'text-slate-800'
                }`}
              >
                {doc.expiry_date ? formatIndonesianDate(doc.expiry_date) : 'Seumur Hidup / Abadi'}
              </span>
            </div>
          </div>

          {/* Physical Location */}
          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Lokasi Fisik Berkas</span>
              <div className="flex items-start gap-1.5 mt-1 text-slate-800">
                <LucideIcon name="MapPin" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="text-xs font-bold">{doc.location || 'Tidak dispesifikasi'}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Gunakan lokasi ini untuk menemukan versi fisik asli jika diperlukan cetak atau verifikasi basah.
            </p>
          </div>
        </div>

        {/* Notes Section */}
        {doc.note && (
          <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Catatan Tambahan</h4>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line select-text">
              {doc.note}
            </p>
          </div>
        )}

        {/* 3. Image Photo Attachment Showcase */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lampiran Foto Dokumen</h4>
          {doc.image ? (
            <div className="space-y-2">
              <div
                onClick={() => setShowFullImage(true)}
                className="border border-slate-150 rounded-2xl overflow-hidden relative cursor-zoom-in group max-h-64 flex items-center justify-center bg-slate-900"
              >
                <img
                  src={doc.image}
                  alt={doc.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-64 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <LucideIcon name="Eye" size={14} />
                    Perbesar Gambar
                  </span>
                </div>
              </div>

              {/* Action buttons on image */}
              <div className="flex gap-2">
                <a
                  href={doc.image}
                  download={`DOCO_${doc.title.replace(/\s+/g, '_')}.jpg`}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 py-2 rounded-xl transition-all cursor-pointer bg-white"
                >
                  <LucideIcon name="Download" size={12} />
                  Simpan Gambar Lokal
                </a>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-250 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 flex flex-col items-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <LucideIcon name="Camera" size={18} />
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                Belum ada lampiran foto untuk dokumen ini. Edit dokumen untuk menambahkan foto KTP/SIM secara aman.
              </p>
              <button
                onClick={() => onEditClick(doc)}
                className="text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-xl cursor-pointer transition-all border border-blue-200/50"
              >
                Unggah Foto Berkas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Fullscreen Zoom Image Overlay Modal */}
      {showFullImage && doc.image && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-4 backdrop-blur-md">
          {/* Top Actions */}
          <div className="flex items-center justify-between text-white p-2">
            <h3 className="font-bold text-sm truncate max-w-[200px]">{doc.title}</h3>
            <button
              onClick={() => setShowFullImage(false)}
              className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full cursor-pointer transition-all"
              title="Tutup Preview"
            >
              <LucideIcon name="X" size={20} />
            </button>
          </div>

          {/* Centered Image */}
          <div className="my-auto flex items-center justify-center overflow-auto max-h-[80vh]">
            <img
              src={doc.image}
              alt={doc.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
          </div>

          {/* Secure Watermark reminder */}
          <div className="text-center space-y-2 pb-safe">
            <p className="text-[10px] text-slate-500 font-mono">
              Enkripsi Lokal DOCO • Privat di Perangkat Anda • Looca Apps
            </p>
            <div className="flex justify-center gap-2 max-w-xs mx-auto">
              <a
                href={doc.image}
                download={`DOCO_${doc.title.replace(/\s+/g, '_')}.jpg`}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <LucideIcon name="Download" size={14} />
                Unduh Gambar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Security alert reminder */}
      <div className="bg-amber-500/10 border border-amber-500/20 text-slate-600 rounded-3xl p-4 flex items-start gap-3">
        <LucideIcon name="Shield" className="text-amber-600 mt-0.5 shrink-0" size={16} />
        <p className="text-xs leading-relaxed font-medium">
          <span className="font-bold text-amber-800">Tips Keamanan:</span> Jangan pernah mengirimkan foto dokumen pribadi (seperti KTP atau KK) lewat aplikasi chat yang tidak terenkripsi. Selalu simpan di DOCO secara offline demi privasi keluarga Anda.
        </p>
      </div>
    </div>
  );
};
