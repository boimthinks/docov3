/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';
import { FamilyMember } from '../types';
import { DEFAULT_CATEGORIES, CATEGORY_MAP } from '../constants';


// Toast notification
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: 'CheckCircle', error: 'XCircle', info: 'Info' } as const;
  const colors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border shadow-lg ${colors[type]} animate-fade-in flex items-center gap-2`}>
      <LucideIcon name={icons[type]} size={16} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// Confirm Modal
interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, confirmText = 'Ya', cancelText = 'Batal', danger = false }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 border border-slate-150 shadow-2xl space-y-4">
        <div className={`w-12 h-12 ${danger ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-600'} border rounded-full flex items-center justify-center mx-auto`}>
          <LucideIcon name="AlertTriangle" size={24} />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl cursor-pointer transition-all">{cancelText}</button>
          <button onClick={onConfirm} className={`flex-1 text-xs font-bold text-white py-2.5 rounded-xl cursor-pointer transition-all ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface MeSettingsProps {
  onForceRelock: () => void;
}

export const MeSettings: React.FC<MeSettingsProps> = ({ onForceRelock }) => {
  const familyMembers = useLiveQuery(() => db.familyMembers.toArray()) || [];
  const securityPinSetting = useLiveQuery(() => db.settings.get('security_pin'));
  const isBioEnabledSetting = useLiveQuery(() => db.settings.get('biometric_enabled'));

  const savedPin = securityPinSetting?.value || '1234';
  const isBioEnabled = isBioEnabledSetting?.value === 'true';

  // State managers
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Ayah' | 'Ibu' | 'Anak' | 'Lainnya'>('Anak');
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  
  const [pinChangeOld, setPinChangeOld] = useState('');
  const [pinChangeNew, setPinChangeNew] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showMinMemberAlert, setShowMinMemberAlert] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestorePayload, setPendingRestorePayload] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Available Tailwind colors for avatar badges
  const colorPalette = [
    'bg-blue-600',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-purple-600',
    'bg-amber-500',
    'bg-indigo-600',
    'bg-slate-600',
  ];

  // Family members list CRUD
  const handleAddOrUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      if (editingMemberId !== null) {
        // Update member
        await db.familyMembers.update(editingMemberId, {
          name: newMemberName.trim(),
          role: newMemberRole,
        });
        setEditingMemberId(null);
      } else {
        // Add member with random color
        const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        await db.familyMembers.add({
          name: newMemberName.trim(),
          role: newMemberRole,
          avatarColor: randomColor,
        });
      }
      setNewMemberName('');
      setNewMemberRole('Anak');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditMemberClick = (m: FamilyMember) => {
    setEditingMemberId(m.id || null);
    setNewMemberName(m.name);
    setNewMemberRole(m.role);
  };

  const handleDeleteMember = async (id?: number) => {
    if (!id) return;
    try {
      // Check if they are the only family member, do not allow delete if so
      if (familyMembers.length <= 1) {
        setShowMinMemberAlert(true);
        return;
      }
      // Delete documents associated with this member, or alert
      setShowDeleteConfirm(id);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteMember = async (id: number) => {
    try {
      await db.familyMembers.delete(id);
      setShowDeleteConfirm(null);
      setToast({ message: 'Anggota keluarga berhasil dihapus.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Gagal menghapus anggota.', type: 'error' });
      console.error(err);
    }
  };

  // Change security PIN
  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess(false);

    if (pinChangeOld !== savedPin) {
      setPinChangeError('PIN Lama salah.');
      return;
    }
    if (pinChangeNew.length !== 4 || isNaN(Number(pinChangeNew))) {
      setPinChangeError('PIN Baru harus berupa 4 digit angka.');
      return;
    }

    try {
      await db.settings.put({ key: 'security_pin', value: pinChangeNew });
      setPinChangeSuccess(true);
      setPinChangeOld('');
      setPinChangeNew('');
    } catch (err) {
      setPinChangeError('Gagal memperbarui PIN.');
    }
  };

  // Toggle biometric fingerprint lock simulation/real
  const handleToggleBiometrics = async () => {
    const nextVal = !isBioEnabled;
    try {
      await db.settings.put({ key: 'biometric_enabled', value: String(nextVal) });
    } catch (err) {
      console.error(err);
    }
  };

  // 100% Real Offline-First JSON Backup Export
  const handleExportBackup = async () => {
    try {
      setBackupSuccess(null);
      // Fetch everything
      const members = await db.familyMembers.toArray();
      const categories = DEFAULT_CATEGORIES;
      const documents = await db.documents.toArray();
      const settings = await db.settings.toArray();

      const backupPayload = {
        version: 2.0,
        appName: 'DOCO_OFFLINE_BACKUP',
        exported_at: Date.now(),
        data: {
          familyMembers: members,
          categories,
          documents,
          settings,
        },
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Trigger automatic local browser download
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `DOCO_BACKUP_${dateStr}.doco`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setBackupSuccess(`Backup berhasil diunduh ke perangkat Anda! Simpan file .doco tersebut dengan aman.`);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal mengekspor file backup.', type: 'error' });
    }
  };

  // 100% Real Backup Import Restore
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const jsonText = event.target?.result as string;
        if (!jsonText) {
          setRestoreError('File kosong atau rusak.');
          return;
        }

        const payload = JSON.parse(jsonText);
        if (payload.appName !== 'DOCO_OFFLINE_BACKUP' || !payload.data) {
          setRestoreError('Format file .doco tidak valid. Pastikan file yang diunggah benar.');
          return;
        }

        setPendingRestorePayload(payload);
        setShowRestoreConfirm(true);
        return;

        // Perform transactional wipe and restore
        await db.transaction('rw', [db.familyMembers, db.documents, db.settings], async () => {
          await db.familyMembers.clear();
          await db.documents.clear();
          await db.settings.clear();

          if (payload.data.settings) {
            for (const s of payload.data.settings) {
              await db.settings.put(s);
            }
          }

          if (payload.data.familyMembers) {
            for (const m of payload.data.familyMembers) {
              await db.familyMembers.add(m);
            }
          }

          // Restore documents (including base64 compressed images!)
          if (payload.data.documents) {
            for (const d of payload.data.documents) {
              await db.documents.add(d);
            }
          }
        });

        setToast({ message: 'Restore berhasil! Aplikasi akan memuat ulang...', type: 'success' });
        window.location.reload();
      } catch (err) {
        console.error(err);
        setRestoreError('Gagal memproses file. Pastikan struktur berkas JSON tidak rusak.');
      }
    };

    reader.readAsText(file);
  };

  const triggerImportFile = () => {
    importFileInputRef.current?.click();
  };

  // Full app data reset (wipe)
  const handleFullWipe = async () => {
    try {
      await db.transaction('rw', [db.familyMembers, db.documents, db.settings], async () => {
        await db.familyMembers.clear();
        await db.documents.clear();
        await db.settings.clear();
      });
      setShowWipeConfirm(false);
      setToast({ message: 'Reset berhasil! Memuat ulang...', type: 'success' });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans select-none selection:bg-blue-600 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan & Keluarga</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Urus profil, keamanan PIN, dan backup cadangan berkas</p>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Min Member Alert */}
      {showMinMemberAlert && (
        <ConfirmModal title="Tidak Bisa Dihapus" message="Minimal harus ada 1 anggota keluarga di database Anda." confirmText="OK" danger onConfirm={() => setShowMinMemberAlert(false)} onCancel={() => setShowMinMemberAlert(false)} />
      )}

      {/* Delete Member Confirm */}
      {showDeleteConfirm !== null && (
        <ConfirmModal title="Hapus Anggota Keluarga" message="PERINGATAN: Menghapus profil ini akan memutus hubungan dokumen miliknya. Tetap hapus?" confirmText="Ya, Hapus" danger onConfirm={() => confirmDeleteMember(showDeleteConfirm)} onCancel={() => setShowDeleteConfirm(null)} />
      )}

      {/* Restore Confirm */}
      {showRestoreConfirm && (
        <ConfirmModal title="Konfirmasi Restore" message="Memulihkan backup akan MENGHAPUS seluruh data aktif saat ini dan menggantinya dengan data dari file backup. Lanjutkan?" confirmText="Ya, Restore" onConfirm={async () => {
          if (!pendingRestorePayload) return;
          try {
            await db.transaction('rw', [db.familyMembers, db.documents, db.settings], async () => {
              await db.familyMembers.clear();
              await db.documents.clear();
              await db.settings.clear();
              const p = pendingRestorePayload;
              if (p.data?.settings) for (const s of p.data.settings) await db.settings.put(s);
              if (p.data?.familyMembers) for (const m of p.data.familyMembers) await db.familyMembers.add(m);
              if (p.data?.documents) for (const d of p.data.documents) await db.documents.add(d);
            });
            setShowRestoreConfirm(false);
            setToast({ message: 'Restore berhasil! Memuat ulang...', type: 'success' });
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            setToast({ message: 'Gagal memulihkan data.', type: 'error' });
            console.error(err);
          }
        }} onCancel={() => setShowRestoreConfirm(false)} />
      )}

      {/* 1. Family Members Management Panel */}
      <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
          <LucideIcon name="Users" className="text-blue-600" size={18} />
          Kelola Anggota Keluarga
        </h3>

        {/* Existing Members list */}
        <div className="space-y-2">
          {familyMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 ${m.avatarColor} text-white font-bold text-xs rounded-xl flex items-center justify-center`}
                >
                  {m.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">{m.name}</h4>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Role: {m.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditMemberClick(m)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                  title="Ubah Nama"
                >
                  <LucideIcon name="Edit" size={14} />
                </button>
                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  title="Hapus Profil"
                >
                  <LucideIcon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Member Form */}
        <form onSubmit={handleAddOrUpdateMember} className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-500">
            {editingMemberId !== null ? 'Ubah Profil Anggota' : 'Tambah Anggota Baru'}
          </h4>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Nama Anggota (Misal: Ibu Siti)"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-250 focus:border-blue-500 outline-none"
              required
              id="settings-form-member-name"
            />

            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-250 focus:border-blue-500 outline-none font-medium"
              id="settings-form-member-role"
            >
              <option value="Ayah">Ayah</option>
              <option value="Ibu">Ibu</option>
              <option value="Anak">Anak</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-md shadow-blue-500/10"
              id="settings-form-member-submit"
            >
              <LucideIcon name="Check" size={14} />
              {editingMemberId !== null ? 'Perbarui' : 'Simpan'}
            </button>
          </div>

          {editingMemberId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingMemberId(null);
                setNewMemberName('');
                setNewMemberRole('Anak');
              }}
              className="text-[10px] text-slate-500 underline font-semibold hover:text-slate-800 cursor-pointer block"
            >
              Batal Edit
            </button>
          )}
        </form>
      </div>

      {/* 2. Security Lock Settings Panel */}
      <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
          <LucideIcon name="Lock" className="text-blue-600" size={18} />
          Keamanan & PIN Kunci
        </h3>

        {/* Change PIN Form */}
        <form onSubmit={handlePinChange} className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700">Ubah PIN Keamanan</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="password"
              maxLength={4}
              placeholder="PIN Lama (Bawaan: 1234)"
              value={pinChangeOld}
              onChange={(e) => setPinChangeOld(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-250 focus:border-blue-500 outline-none font-mono"
              required
              id="settings-pin-old"
            />
            <input
              type="password"
              maxLength={4}
              placeholder="PIN Baru (4 Digit)"
              value={pinChangeNew}
              onChange={(e) => setPinChangeNew(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-250 focus:border-blue-500 outline-none font-mono"
              required
              id="settings-pin-new"
            />
          </div>

          {pinChangeError && <p className="text-[10px] text-red-600 font-bold">{pinChangeError}</p>}
          {pinChangeSuccess && <p className="text-[10px] text-emerald-600 font-bold">PIN Berhasil Diperbarui!</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all"
              id="settings-btn-pin-submit"
            >
              Simpan PIN Baru
            </button>

            <button
              type="button"
              onClick={onForceRelock}
              className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <LucideIcon name="Lock" size={14} />
              Kunci Sekarang (Tes Lock Screen)
            </button>
          </div>
        </form>

        {/* Biometrics Switch Toggle */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Sensor Sidik Jari (Web Authn / Biometrik)
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Gunakan pembaca sidik jari HP Anda untuk akses instan tanpa PIN.
            </p>
          </div>

          <button
            onClick={handleToggleBiometrics}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
              isBioEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            id="settings-toggle-bio"
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform duration-250 ${
                isBioEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Offline-First Backup & Restore (Real file download & reader) */}
      <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
          <LucideIcon name="Database" className="text-blue-600" size={18} />
          Ekspor / Impor Backup (Local System)
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          Karena DOCO 100% offline demi privasi, Anda wajib melakukan ekspor berkas backup secara berkala untuk memindahkan data ke HP baru atau mencegah kehilangan data jika browser dibersihkan.
        </p>

        {backupSuccess && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs p-3.5 rounded-2xl font-medium leading-relaxed">
            {backupSuccess}
          </div>
        )}

        {restoreError && (
          <div className="bg-red-50 border border-red-250 text-red-800 text-xs p-3.5 rounded-2xl font-bold">
            {restoreError}
          </div>
        )}

        {/* Hidden File input for import restore */}
        <input
          type="file"
          accept=".doco,application/json"
          ref={importFileInputRef}
          onChange={handleImportBackup}
          className="hidden"
          id="hidden-import-input"
        />

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Export Button */}
          <button
            onClick={handleExportBackup}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            id="settings-btn-backup-export"
          >
            <LucideIcon name="Download" size={14} />
            Ekspor File Cadangan (.doco)
          </button>

          {/* Import Button */}
          <button
            onClick={triggerImportFile}
            className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer border border-slate-300 flex items-center justify-center gap-1.5"
            id="settings-btn-backup-import"
          >
            <LucideIcon name="Upload" size={14} />
            Pulihkan Berkas Cadangan
          </button>
        </div>
      </div>

      {/* 4. Danger Zone Wipe / Reset App */}
      <div className="bg-red-50/50 border border-red-100 rounded-3xl p-5 space-y-3.5">
        <h3 className="text-xs font-black text-red-800 flex items-center gap-1 uppercase tracking-wider">
          <LucideIcon name="AlertTriangle" size={16} />
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800">Reset Semua Data & Berkas</h4>
            <p className="text-[10px] text-slate-500 max-w-sm leading-normal">
              Tindakan ini akan menghapus seluruh profil, database IndexedDB, dan file foto KTP/SIM dari browser Anda selamanya. Pastikan Anda sudah mengekspor file cadangan.
            </p>
          </div>

          <button
            onClick={() => setShowWipeConfirm(true)}
            className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0 shadow-md shadow-red-500/10"
            id="settings-btn-wipe-app"
          >
            Reset Aplikasi
          </button>
        </div>
      </div>

      {/* Wipe Confirm Modal */}
      {showWipeConfirm && (
        <ConfirmModal
          title="Konfirmasi Wipe Total"
          message="Apakah Anda benar-benar yakin ingin menghapus SELURUH data dokumen keluarga Anda? Tindakan ini permanen dan mutlak."
          onConfirm={handleFullWipe}
          onCancel={() => setShowWipeConfirm(false)}
          confirmText="Reset Sekarang"
          cancelText="Batal"
          danger
        />
      )}

      {/* About Box */}
      <div className="text-center space-y-1 text-[11px] text-slate-400 py-4">
        <p className="font-bold text-slate-500">DOCO v2.0 - Offline Secure Family Vault</p>
        <p>Tipe Build: Progressive Web App (PWA) Offline-Optimized</p>
        <p>Dirancang di Indonesia • Produk Keamanan dari Looca Apps</p>
      </div>
    </div>
  );
};
