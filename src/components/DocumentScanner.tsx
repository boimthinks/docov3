import { useState, useRef } from 'react';
import { performOCR, ExtractedData, OCRResult } from '../ocr';

interface DocumentScannerProps {
  onScanComplete: (data: OCRResult) => void;
  onCancel?: () => void;
}

export function DocumentScanner({ onScanComplete, onCancel }: DocumentScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setIsScanning(true);

    try {
      const result = await performOCR(file);
      onScanComplete(result);
    } catch (err) {
      setError('Gagal memproses gambar. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="scanner-container p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Scan Dokumen</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto mb-4"
          />
        ) : (
          <div className="text-gray-500">
            <p className="mb-2">Ambil foto atau pilih gambar dokumen</p>
            <p className="text-sm">Format: JPG, PNG, WEBP</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={handleCapture}
          disabled={isScanning}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isScanning ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </span>
          ) : (
            'Ambil Foto'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
    </div>
  );
}