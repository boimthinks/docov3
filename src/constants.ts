/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from './types';

// Kategori statis - tidak disimpan di database, selalu tersedia
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Identitas (KTP/SIM/Paspor)', icon: 'Contact', color: 'blue' },
  { id: 2, name: 'Keluarga (KK/Akte Lahir)', icon: 'Users', color: 'purple' },
  { id: 3, name: 'Sertifikat (Tanah/Rumah)', icon: 'FileBadge', color: 'amber' },
  { id: 4, name: 'Keuangan (Polis/Tabungan)', icon: 'Wallet', color: 'emerald' },
  { id: 5, name: 'Pendidikan (Ijazah/Rapor)', icon: 'GraduationCap', color: 'indigo' },
  { id: 6, name: 'Kesehatan (BPJS/KMS)', icon: 'Activity', color: 'red' },
  { id: 7, name: 'Lainnya', icon: 'FileText', color: 'slate' },
];

// Helper untuk lookup kategori by ID
export const getCategoryById = (id: number | string): Category | undefined => {
  const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
  return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
};

// Map untuk performa lookup yang lebih baik
export const CATEGORY_MAP: Record<number, Category> = DEFAULT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id!] = cat;
  return acc;
}, {} as Record<number, Category>);
