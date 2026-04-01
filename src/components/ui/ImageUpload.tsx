import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { apiClient } from '@/core/api/api-client';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = 'Imagen',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await apiClient.post(
          `/uploads/image?folder=${folder}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          },
        );

        const url = data?.url ?? data?.data?.url;
        if (url) {
          onChange(url);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || 'Error al subir la imagen';
        setError(msg);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange],
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      upload(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleRemove() {
    onChange('');
    setError(null);
  }

  return (
    <div className={className}>
      {label && (
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {value ? (
        /* Preview */
        <div className="relative group">
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg p-1.5 text-xs"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
              }}
              title="Cambiar imagen"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg p-1.5 text-xs"
              style={{
                backgroundColor: 'var(--error-container)',
                color: 'var(--error)',
              }}
              title="Eliminar imagen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 px-4 cursor-pointer transition-colors"
          style={{
            borderColor: dragOver
              ? 'var(--primary)'
              : 'var(--border)',
            backgroundColor: dragOver
              ? 'var(--primary-container)'
              : 'var(--surface-variant)',
          }}
        >
          {uploading ? (
            <>
              <div
                className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin mb-2"
                style={{ borderColor: 'var(--primary)' }}
              />
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Subiendo y optimizando...
              </p>
            </>
          ) : (
            <>
              <ImageIcon
                className="h-8 w-8 mb-2"
                style={{ color: 'var(--text-muted)' }}
              />
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Arrastra una imagen o haz clic
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                JPG, PNG, WebP, GIF — Max 10 MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
