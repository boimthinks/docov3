/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document } from './types';

export interface ExpiryStatus {
  status: 'safe' | 'warning' | 'danger';
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  daysRemaining: number | null;
}

export function getExpiryStatus(expiryDateStr?: string): ExpiryStatus {
  if (!expiryDateStr) {
    return {
      status: 'safe',
      label: 'Seumur Hidup',
      colorClass: 'text-emerald-700 bg-emerald-50',
      bgClass: 'bg-emerald-500',
      borderClass: 'border-emerald-200',
      daysRemaining: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiryDate = new Date(expiryDateStr);
  expiryDate.setHours(0, 0, 0, 0);

  // Time difference in milliseconds
  const diffTime = expiryDate.getTime() - today.getTime();
  // Calculate days remaining
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      status: 'danger',
      label: `Kadaluarsa (${Math.abs(daysRemaining)} hari lalu)`,
      colorClass: 'text-red-700 bg-red-50',
      bgClass: 'bg-red-500',
      borderClass: 'border-red-200',
      daysRemaining,
    };
  } else if (daysRemaining <= 7) {
    return {
      status: 'danger',
      label: `Bahaya (${daysRemaining} hari lagi)`,
      colorClass: 'text-red-700 bg-red-50',
      bgClass: 'bg-red-500',
      borderClass: 'border-red-200',
      daysRemaining,
    };
  } else if (daysRemaining <= 30) {
    return {
      status: 'warning',
      label: `Peringatan (${daysRemaining} hari lagi)`,
      colorClass: 'text-amber-700 bg-amber-50',
      bgClass: 'bg-amber-500',
      borderClass: 'border-amber-200',
      daysRemaining,
    };
  } else {
    return {
      status: 'safe',
      label: `Aman (${daysRemaining} hari lagi)`,
      colorClass: 'text-emerald-700 bg-emerald-50',
      bgClass: 'bg-emerald-500',
      borderClass: 'border-emerald-200',
      daysRemaining,
    };
  }
}

// Help format Indonesian dates
export function formatIndonesianDate(dateStr?: string): string {
  if (!dateStr) return 'Seumur Hidup';
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateStr;
  }
}

// Compress image via canvas helper
export function compressImage(base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Compress and convert to base64 jpeg
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
