/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../db';
import { LucideIcon } from './LucideIcon';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Ayah' | 'Ibu' | 'Anak' | 'Lainnya'>('Ayah');
  
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextStep = () => {
    setErrorMsg('');
    
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (pin.length !== 4 || isNaN(Number(pin))) {
        setErrorMsg('PIN harus terdiri dari 4 digit angka.');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMsg('Konfirmasi PIN tidak cocok.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama wajib diisi untuk membuat profil pertama Anda.');
      return;
    }

    try {
      // Save setup settings
      await db.settings.put({ key: 'security_pin', value: pin });
      await db.settings.put({ key: 'setup_completed', value: 'true' });
      await db.settings.put({ key: 'biometric_enabled', value: 'false' });

      // Add first family member
      await db.familyMembers.add({
        name: name.trim(),
        role: role,
        avatarColor: 'bg-blue-600',
      });

      onComplete();
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal menyelesaikan inisialisasi.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 text-white z-50 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-blue-600">
      {/* Background radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_40%)] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center mt-6 text-center relative z-10">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/10 mb-3">
          <LucideIcon name="Shield" className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-black tracking-tight">DOCO Setup</h1>
        <p className="text-xs text-slate-400">Inisialisasi Brankas Lokal Anda</p>

        {/* Step dots */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                step === s ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs font-semibold text-center max-w-xs mx-auto my-2 relative z-10">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Slide Contents */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 py-6">
        {step === 1 && (
          <div className="space-y-4 text-center animate-fade-in">
            <h2 className="text-xl font-bold text-slate-100">Selamat Datang di DOCO!</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Doco adalah aplikasi <span className="font-semibold text-blue-400">Offline-First Private Document Vault</span> yang dirancang khusus untuk mengamankan seluruh surat berharga (KTP, SIM, KK, Ijazah, dll) Anda dan keluarga secara mandiri.
            </p>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-left space-y-3">
              <div className="flex gap-3">
                <LucideIcon name="Shield" className="text-emerald-400 shrink-0" size={18} />
                <p className="text-xs text-slate-300">
                  <span className="font-bold text-slate-100 block">Privasi Tingkat Tinggi</span>
                  Data tidak pernah diunggah ke internet. Foto dokumen dienkripsi lokal di perangkat Anda.
                </p>
              </div>
              <div className="flex gap-3">
                <LucideIcon name="Clock" className="text-blue-400 shrink-0" size={18} />
                <p className="text-xs text-slate-300">
                  <span className="font-bold text-slate-100 block">Akses Instan Offline</span>
                  Aplikasi dapat dibuka kapan saja dan di mana saja bahkan tanpa koneksi internet/sinyal HP.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center animate-fade-in">
            <h2 className="text-xl font-bold text-slate-100">Buat PIN Keamanan Anda</h2>
            <p className="text-xs text-slate-400">
              PIN ini digunakan untuk mengunci aplikasi agar tidak dapat diakses orang asing saat HP Anda dipinjam.
            </p>

            <div className="space-y-3 max-w-xs mx-auto pt-2">
              <input
                type="password"
                maxLength={4}
                placeholder="Buat 4 Digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-blue-500 font-mono text-xl tracking-widest outline-none"
                id="ob-pin"
              />
              <input
                type="password"
                maxLength={4}
                placeholder="Konfirmasi 4 Digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-blue-500 font-mono text-xl tracking-widest outline-none"
                id="ob-confirmpin"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleFinish} className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-100">Profil Anggota Pertama</h2>
              <p className="text-xs text-slate-400">
                Buat satu profil anggota keluarga untuk menghubungkan dokumen-dokumen Anda.
              </p>
            </div>

            <div className="space-y-3 bg-slate-800/30 border border-slate-700/30 p-5 rounded-2xl">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">Nama Profil Pertama</label>
                <input
                  type="text"
                  placeholder="Contoh: Ayah Budi, Ibu Siti, dll."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-750 focus:border-blue-500 text-sm outline-none font-medium"
                  required
                  id="ob-name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">Hubungan / Peran</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-750 focus:border-blue-500 text-sm outline-none font-medium"
                  id="ob-role"
                >
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Anak">Anak</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="max-w-md w-full mx-auto relative z-10 flex gap-3 pt-4 border-t border-slate-800">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-750 rounded-xl transition-all cursor-pointer text-center"
          >
            Kembali
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={handleNextStep}
            className="flex-grow py-3 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/15 cursor-pointer text-center"
          >
            Lanjutkan
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex-grow py-3 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/15 cursor-pointer text-center flex items-center justify-center gap-1.5"
            id="ob-btn-finish"
          >
            <LucideIcon name="Check" size={16} />
            Mulai Gunakan DOCO
          </button>
        )}
      </div>
    </div>
  );
};
// Default export for safety
export default Onboarding;
