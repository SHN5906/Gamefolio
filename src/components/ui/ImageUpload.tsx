'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  value:    string | null
  onChange: (url: string | null) => void
  bucket?:  string                   // Storage bucket name
  pathPrefix?: string                // ex: "sealed-products/"
  maxSizeMB?: number
  aspectRatio?: 'card' | 'box' | 'square'  // pour le placeholder
  label?:   string
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

export function ImageUpload({
  value,
  onChange,
  bucket = 'sealed-products',
  pathPrefix = '',
  maxSizeMB = 5,
  aspectRatio = 'box',
  label = 'Photo du produit',
}: ImageUploadProps) {
  const [uploading, setUploading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [dragOver, setDragOver]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ratio = aspectRatio === 'card' ? '2.5/3.5' : aspectRatio === 'square' ? '1/1' : '4/3'

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // Validation
    if (!ACCEPTED.includes(file.type)) {
      setError('Format invalide. Utilise JPG, PNG ou WEBP.')
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Fichier trop lourd (max ${maxSizeMB} Mo).`)
      return
    }

    setUploading(true)

    try {
      // Mode démo (pas de Supabase) → on génère un URL local de preview via FileReader
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const reader = new FileReader()
        reader.onload = () => {
          onChange(reader.result as string)  // data URL
          setUploading(false)
        }
        reader.readAsDataURL(file)
        return
      }

      // Upload réel Supabase Storage
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${pathPrefix}${user.id}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: true })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(urlData.publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload échoué')
    } finally {
      setUploading(false)
    }
  }, [bucket, pathPrefix, maxSizeMB, onChange])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
        {label}
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !value && inputRef.current?.click()}
        className="relative rounded-[var(--radius-md)] border-2 border-dashed overflow-hidden transition-all duration-200 group"
        style={{
          aspectRatio: ratio,
          width: '100%',
          maxWidth: aspectRatio === 'card' ? 140 : aspectRatio === 'square' ? 100 : 300,
          background: dragOver ? 'var(--color-brand-soft)' : 'var(--color-bg-glass)',
          borderColor: dragOver ? 'var(--color-brand)' : value ? 'var(--color-border-strong)' : 'var(--color-border)',
          cursor: value ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      >
        {/* Image preview */}
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[11px] font-semibold text-white border"
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <Camera size={12} />
                Remplacer
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); setError(null) }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[11px] font-semibold text-white"
                style={{ background: 'var(--color-negative)' }}
              >
                <X size={12} />
                Supprimer
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 size={22} className="animate-spin" style={{ color: 'var(--color-brand)' }} />
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Upload en cours…</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 text-center overflow-hidden">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg-glass-hi)' }}>
              {dragOver ? (
                <Upload size={15} style={{ color: 'var(--color-brand)' }} strokeWidth={2.2} />
              ) : (
                <ImageIcon size={15} style={{ color: 'var(--color-text-muted)' }} strokeWidth={2} />
              )}
            </div>
            <p className="text-[10px] font-semibold leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
              {dragOver ? 'Lâche ici' : 'Photo'}
            </p>
            <p className="text-[9px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              JPG / PNG<br />max {maxSizeMB} Mo
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
      </div>

      {error && (
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-negative)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
