export interface FamilyMember {
  id?: number;
  name: string;
  role: 'Ayah' | 'Ibu' | 'Anak' | 'Lainnya';
  avatarColor: string; // Tailwind bg-color class
}

export interface Category {
  id?: number;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind text/bg color prefix
}

export interface Document {
  id?: number;
  title: string;
  ownerId: number; // Relation to FamilyMember
  categoryId: number; // Relation to Category
  number: string; // NIK / Document Number
  issue_date?: string; // YYYY-MM-DD
  expiry_date?: string; // YYYY-MM-DD (null for lifetime)
  location: string; // Physical storage location
  note?: string;
  image?: string; // Base64 Compressed Image
  scanned_at?: string; // When document was scanned
  ocr_data: {
    nik?: string;
    nama?: string;
    tempat_tgl_lahir?: string;
    jenis_kelamin?: string;
    golongan_darah?: string;
    alamat?: string;
    rt_rw?: string;
    kel_desa?: string;
    kecamatan?: string;
    agama?: string;
    status_perkawinan?: string;
    pekerjaan?: string;
    kewarganegaraan?: string;
    berlaku_hingga?: string;
  };
  created_at: number;
  updated_at: number;
}

export interface AppSetting {
  key: string;
  value: any;
}

export type ViewState = 'home' | 'documents' | 'alerts' | 'me';