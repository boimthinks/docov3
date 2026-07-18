/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { Table } from 'dexie';
import { FamilyMember, Document, AppSetting } from './types';

export class DocoDexie extends Dexie {
  familyMembers!: Table<FamilyMember, number>;
  documents!: Table<Document, number>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('DocoDatabase');
    // v1: original schema (includes categories table from old data)
    this.version(1).stores({
      familyMembers: '++id, name, role',
      categories: '++id, name, icon',
      documents: '++id, title, ownerId, categoryId, number, expiry_date',
      settings: 'key, value',
    });
    // v2: drop categories table (now using static constants)
    this.version(2).stores({
      familyMembers: '++id, name, role',
      documents: '++id, title, ownerId, categoryId, number, expiry_date',
      settings: 'key, value',
    });
  }
}

export const db = new DocoDexie();

// Seed database with default settings only (no sample data, no categories)
export async function seedDatabase() {
  // Ensure default configuration settings exist
  const securitySetting = await db.settings.get('security_pin');
  if (!securitySetting) {
    await db.settings.put({ key: 'security_pin', value: '1234' }); // Default pin
  }

  const setupCompleted = await db.settings.get('setup_completed');
  if (!setupCompleted) {
    await db.settings.put({ key: 'setup_completed', value: 'true' });
  }

  const autoLock = await db.settings.get('auto_lock');
  if (!autoLock) {
    await db.settings.put({ key: 'auto_lock', value: 'true' });
  }

  const bioSetting = await db.settings.get('biometric_enabled');
  if (!bioSetting) {
    await db.settings.put({ key: 'biometric_enabled', value: 'false' });
  }
}
