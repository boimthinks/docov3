/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';
import { compressImage } from '../utils';
import { Document, Category, FamilyMember } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_MAP } from '../constants';

interface AddEditDocumentProps {
  documentToEdit?: Document;
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const AddEditDocument: React.FC<AddEditDocumentProps> = ({
  documentToEdit,
  onBack,
  onSaveSuccess,
}) => {
  const isEdit = !!documentToEdit;

  const categories = DEFAULT_CATEGORIES;
  const familyMembers = useLiveQuery(() => db.familyMembers.toArray()) || [];

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [number, setNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isLifetime, setIsLifetime] = useState(true);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize form if editing
  useEffect(() => {
    if (documentToEdit) {
      setTitle(documentToEdit.title);
      setCategoryId(String(documentToEdit.categoryId));
      setOwnerId(String(documentToEdit.ownerId));
      setNumber(documentToEdit.number);
      setIssueDate(documentToEdit.issue_date || '');
      
      if (documentToEdit.expiry_date) {
        setExpiryDate(documentToEdit.expiry_date);
        setIsLifetime(false);
      } else {
        setExpiryDate('');
        setIsLifetime(true);
      }
      
      setLocation(documentToEdit.location);
      setNote(documentToEdit.note || '');
      setImage(documentToEdit.image);
      setImagePreview(documentToEdit.image || null);
    } else {
      // Defaults for new document
      setTitle('');
      setCategoryId('');
      setOwnerId('');
      setNumber('');
      setIssueDate('');
      setExpiryDate('');
      setIsLifetime(true);
      setLocation('');
      setNote('');
      setImage(undefined);
      setImagePreview(null);
    }
  }, [documentToEdit]);

  // Handle setting defaults if categories/members finish loading and it's a NEW document
  useEffect(() => {
    if (!isEdit && categories.length > 0 && !categoryId) {
      setCategoryId(String(categories[0].id));
    }
    if (!isEdit && familyMembers.length > 0 && !ownerId) {
      setOwnerId(String(familyMembers[0].id));
    }
  }, [categories, familyMembers, isEdit, categoryId, ownerId]);

  // Handle local image file loading & auto-compression
  const handleImageFile = async (file: File) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const rawBase64 = e.target?.result as string;
        if (rawBase64) {
          // Compress the image directly to prevent IndexedDB storage bloating
          const compressed = await compressImage(rawBase64, 800, 800);
          setImage(compressed);
          setImagePreview(compressed);
        }
        setLoading(false);
      };

      reader.onerror = () => {
        setErrorMsg('Gagal membaca file gambar.');
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mengunggah foto.');
      setLoading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(undefined);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Nama dokumen wajib diisi.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Kategori wajib dipilih.');
      return;
    }
    if (!ownerId) {
      setErrorMsg('Pemilik dokumen wajib dipilih.');
      return;
    }

    try {
      setLoading(true);

      const documentData: Omit<Document, 'id'> = {
        title: title.trim(),
        categoryId: Number(categoryId),
        ownerId: Number(ownerId),
        number: number.trim(),
        issue_date: issueDate || undefined,
        expiry_date: isLifetime ? undefined : expiryDate || undefined,
        location: location.trim(),
        note: note.trim() || undefined,
        image: image,
        created_at: isEdit ? documentToEdit.created_at : Date.now(),
        updated_at: Date.now(),
      };

      if (isEdit && documentToEdit?.id) {
        await db.documents.update(documentToEdit.id, documentData);
      } else {
        await db.documents.add(documentData);
      }

      setLoading(false);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat menyimpan dokumen.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans select-none selection:bg-blue-600 animate-fade-in">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          id="addedit-btn-back"
        >
          <LucideIcon name="ChevronLeft" size={14} />
          Batal
        </button>

        <h2 className="text-sm font-black text-slate-800 tracking-tight">
          {isEdit ? 'Ubah Dokumen' : 'Tambah Dokumen Baru'}
        </h2>

        <div className="w-[60px]" /> {/* Spacer to align title centered */}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <LucideIcon name="AlertTriangle" size={16} />
          {errorMsg}
        </div>
      )}

      {/* 2. Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-5">
        
        {/* Document Title / Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            Nama Dokumen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: KTP Ayah Budi, SIM A Ibu, KK Utama"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium"
            required
            id="form-title"
          />
        </div>

        {/* Categories & Owner Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Kategori Berkas <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium"
              required
              id="form-category"
            >
              <option value="" disabled>Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Owner/Member selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Pemilik / Anggota Keluarga <span className="text-red-500">*</span>
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium"
              required
              id="form-owner"
            >
              <option value="" disabled>Pilih Pemilik</option>
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NIK / Document ID Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Nomor Registrasi / NIK / No. Seri Dokumen
          </label>
          <input
            type="text"
            placeholder="Contoh: NIK KTP (16 Digit) / Nomor SIM / Nomor Sertifikat"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-mono font-bold"
            id="form-number"
          />
        </div>

        {/* Issue & Expiry Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Issue Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Tanggal Terbit / Cetak</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium"
              id="form-issuedate"
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Tanggal Kadaluarsa</label>
              <label className="flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLifetime}
                  onChange={(e) => {
                    setIsLifetime(e.target.checked);
                    if (e.target.checked) setExpiryDate('');
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-100 cursor-pointer"
                  id="form-checkbox-lifetime"
                />
                Seumur Hidup
              </label>
            </div>
            
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isLifetime}
              className={`w-full px-4 py-2.5 text-sm rounded-2xl border transition-all outline-none font-medium ${
                isLifetime
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50/70 focus:bg-white text-slate-800 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
              id="form-expirydate"
            />
          </div>
        </div>

        {/* Physical Storage Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            Lokasi Penyimpanan Fisik Asli
          </label>
          <input
            type="text"
            placeholder="Contoh: Laci Kedua Lemari Utama, Stopmap Biru Kamar Ayah, Dompet Kulit"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium"
            id="form-location"
          />
        </div>

        {/* Note / Catatan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Catatan Penting Dokumen</label>
          <textarea
            placeholder="Tambahkan informasi tambahan (Misal: perpanjangan SIM di Polres mana, nomor kontak bantuan asuransi, dll.)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium resize-none"
            id="form-note"
          />
        </div>

        {/* Image upload section (Local Camera + File Picker) */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="text-xs font-bold text-slate-700 block">
            Foto Lampiran Berkas (Opsional)
          </label>

          {/* Hidden standard file pickers */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={onFileInputChange}
            className="hidden"
            id="hidden-file-input"
          />

          {/* Hidden camera picker - triggers native camera app fully on phone */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={onFileInputChange}
            className="hidden"
            id="hidden-camera-input"
          />

          {imagePreview ? (
            <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 flex flex-col items-center justify-center max-h-56">
              <img
                src={imagePreview}
                alt="Upload Preview"
                referrerPolicy="no-referrer"
                className="max-h-52 object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer transition-colors shadow-lg"
                title="Hapus Foto"
                id="form-btn-remove-image"
              >
                <LucideIcon name="X" size={14} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center space-y-4 bg-slate-50/50 flex flex-col items-center justify-center transition-all">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <LucideIcon name="Camera" size={24} />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Ambil Foto atau Pilih Berkas</p>
                <p className="text-[10px] text-slate-400">
                  Format JPG, PNG (Maks 10MB). Gambar otomatis dikompres sebelum disimpan secara lokal.
                </p>
              </div>

              <div className="flex gap-2">
                {/* Take Photo Button */}
                <button
                  type="button"
                  onClick={triggerCamera}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                  id="form-btn-camera"
                >
                  <LucideIcon name="Camera" size={14} />
                  Kamera HP
                </button>

                {/* Upload File Button */}
                <button
                  type="button"
                  onClick={triggerSelectFile}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                  id="form-btn-file"
                >
                  <LucideIcon name="Upload" size={14} />
                  Pilih Galeri
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Save Controls */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-3 rounded-2xl cursor-pointer transition-all text-center"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl cursor-pointer transition-all text-center shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
            disabled={loading}
            id="form-btn-submit"
          >
            {loading ? (
              <LucideIcon name="RefreshCw" className="animate-spin" size={14} />
            ) : (
              <LucideIcon name="Check" size={14} />
            )}
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Dokumen'}
          </button>
        </div>
      </form>
    </div>
  );
};
