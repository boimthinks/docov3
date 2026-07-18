import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  nik?: string;
  nama?: string;
  tempatTglLahir?: string;
  jenisKelamin?: string;
  golonganDarah?: string;
  alamat?: string;
  rtRw?: string;
  kelDesa?: string;
  kecamatan?: string;
  agama?: string;
  statusPerkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  berlakuHingga?: string;
}

export interface ExtractedData {
  nik?: string;
  nama?: string;
  tempatTglLahir?: string;
  jenisKelamin?: string;
  golonganDarah?: string;
  alamat?: string;
  rtRw?: string;
  kelDesa?: string;
  kecamatan?: string;
  agama?: string;
  statusPerkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  berlakuHingga?: string;
}

export async function performOCR(imageSource: string | File): Promise<OCRResult> {
  const result = await Tesseract.recognize(imageSource, 'ind+eng', {
    logger: m => console.log(m),
  });

  const text = result.data.text;
  const confidence = result.data.confidence;

  return {
    text,
    confidence,
    ...extractDataFromText(text)
  };
}

export function extractDataFromText(text: string): ExtractedData {
  const data: ExtractedData = {};

  // NIK (16 digit)
  const nikMatch = text.match(/(\d{16})/);
  if (nikMatch) {
    data.nik = nikMatch[1];
  }

  // Nama
  const namaMatch = text.match(/Nama[:\s]+([A-Z\s]+?)(?:\n|$)/i);
  if (namaMatch) {
    data.nama = namaMatch[1].trim();
  }

  // Tempat Tanggal Lahir
  const ttlMatch = text.match(/Tempat.*?Tgl.*?Lahir[:\s]+([A-Z\s,0-9]+?)(?:\n|$)/i);
  if (ttlMatch) {
    data.tempatTglLahir = ttlMatch[1].trim();
  }

  // Jenis Kelamin
  const jkMatch = text.match(/Jenis.*?Kelamin[:\s]+(LAKI-LAKI|PEREMPUAN|LAKI|P)/i);
  if (jkMatch) {
    data.jenisKelamin = jkMatch[1].toUpperCase();
  }

  // Golongan Darah
  const gdMatch = text.match(/Gol.*?Darah[:\s]+([ABO]+[\s-]*)/i);
  if (gdMatch) {
    data.golonganDarah = gdMatch[1].trim();
  }

  // Alamat
  const alamatMatch = text.match(/Alamat[:\s]+(.+?)(?:\n|$)/i);
  if (alamatMatch) {
    data.alamat = alamatMatch[1].trim();
  }

  // RT/RW
  const rtRwMatch = text.match(/RT\/RW[:\s]+(\d+\/\d+)/i);
  if (rtRwMatch) {
    data.rtRw = rtRwMatch[1];
  }

  // Kel/Desa
  const kelDesaMatch = text.match(/Kel.*?Desa[:\s]+(.+?)(?:\n|$)/i);
  if (kelDesaMatch) {
    data.kelDesa = kelDesaMatch[1].trim();
  }

  // Kecamatan
  const kecamatanMatch = text.match(/Kecamatan[:\s]+(.+?)(?:\n|$)/i);
  if (kecamatanMatch) {
    data.kecamatan = kecamatanMatch[1].trim();
  }

  // Agama
  const agamaMatch = text.match(/Agama[:\s]+(ISLAM|KRISTEN|KATOLIK|HINDU|BUDDHA|KONGHUCU)/i);
  if (agamaMatch) {
    data.agama = agamaMatch[1].toUpperCase();
  }

  // Status Perkawinan
  const spMatch = text.match(/Status.*?Kawin[:\s]+(KAWIN|BELUM KAWIN|CERAI HIDUP|CERAI MATI)/i);
  if (spMatch) {
    data.statusPerkawinan = spMatch[1].toUpperCase();
  }

  // Pekerjaan
  const pekerjaanMatch = text.match(/Pekerjaan[:\s]+(.+?)(?:\n|$)/i);
  if (pekerjaanMatch) {
    data.pekerjaan = pekerjaanMatch[1].trim();
  }

  // Kewarganegaraan
  const wnMatch = text.match(/Kewarganegaraan[:\s]+(WNI|WNA)/i);
  if (wnMatch) {
    data.kewarganegaraan = wnMatch[1].toUpperCase();
  }

  // Berlaku Hingga
  const berlakuMatch = text.match(/Berlaku.*?Hingga[:\s]+(SEUMUR HIDUP|[\d./-]+)/i);
  if (berlakuMatch) {
    data.berlakuHingga = berlakuMatch[1].toUpperCase();
  }

  return data;
}