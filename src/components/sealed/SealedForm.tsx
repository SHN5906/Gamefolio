'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, AlertCircle, PackageOpen, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { SEALED_TYPE_LABELS, type SealedType } from '@/lib/mock'

// ── Schema ─────────────────────────────────────────────────────────
const schema = z.object({
  name:          z.string().min(2, 'Nom requis (min 2 car.)'),
  type:          z.enum(['display', 'etb', 'coffret', 'blister', 'deck', 'tin', 'bundle', 'promo']),
  set:           z.string().min(2, 'Extension requise'),
  language:      z.enum(['FR', 'EN', 'JP', 'DE', 'ES', 'IT', 'PT']),
  condition:     z.enum(['sealed', 'opened']),
  quantity:      z.preprocess(
    v => (v === '' || isNaN(Number(v)) ? 1 : Number(v)),
    z.number().int().min(1).max(999)
  ),
  purchase_price: z.preprocess(
    v => (v === '' || isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
  purchase_date:  z.string().optional(),
  notes:         z.string().max(500).optional(),
})
type FormData = z.infer<typeof schema>

// ── Suggestions de noms de sets ────────────────────────────────────
const SET_SUGGESTIONS = [
  'Fable Nébuleuse', 'Mascarade Crépusculaire', 'Surging Sparks',
  'Héros Transcendant', '151', 'Évolutions à Paldea', 'Feux Paradoxaux',
  'Obsidienne Flammes', 'Écarlate & Violet', 'Destinées de Paldea',
]

// ── Chip de sélection ──────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className="h-8 px-3 rounded-[var(--radius-sm)] text-[12px] font-medium border transition-all duration-150"
      style={{
        background:  active ? 'var(--color-brand)'  : 'var(--color-bg-glass)',
        borderColor: active ? 'var(--color-brand)'  : 'var(--color-border)',
        color:       active ? 'white'                : 'var(--color-text-secondary)',
        boxShadow:   active ? '0 0 12px var(--color-brand-glow)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
      {children}
    </p>
  )
}

// ── Composant principal ────────────────────────────────────────────
export function SealedForm() {
  const router = useRouter()
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [setSearch, setSetSearch] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type:      'coffret',
      language:  'FR',
      condition: 'sealed',
      quantity:  1,
    },
  })

  const watchType      = watch('type')
  const watchLang      = watch('language')
  const watchCondition = watch('condition')
  const watchSet       = watch('set')

  const filteredSuggestions = SET_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes((watchSet ?? '').toLowerCase()) && watchSet?.length >= 1
  )

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      // Mode démo
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await new Promise(r => setTimeout(r, 500))
        setSaved(true)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Tu dois être connecté.'); setLoading(false); return }

      const { error: err } = await supabase.from('user_sealed').insert({
        user_id:            user.id,
        name:               data.name,
        type:               data.type,
        set_name:           data.set,
        language:           data.language.toLowerCase(),
        state:              data.condition,
        quantity:           data.quantity,
        purchase_price_eur: data.purchase_price ?? null,
        purchase_date:      data.purchase_date  ?? null,
        notes:              data.notes          ?? null,
        image_url:          imageUrl,
      })
      if (err) throw err
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // ── Vue succès ─────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-positive-soft)' }}>
          <Check size={28} style={{ color: 'var(--color-positive)' }} strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className="text-[20px] font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Scellé ajouté !
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            {watch('name')} a été ajouté à ton portfolio.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={() => { setSaved(false) }} style={{ background: 'var(--color-bg-glass-hi)', color: 'var(--color-text-primary)' }}>
            Ajouter un autre
          </Button>
          <Button type="button" onClick={() => router.push('/collection')}>
            Voir ma collection
          </Button>
        </div>
      </div>
    )
  }

  // ── Formulaire ─────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto px-6 pb-8">
      <div className="max-w-xl">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-5">

          {/* ── NOM DU PRODUIT ── */}
          <div>
            <Input
              label="Nom du produit"
              placeholder="Coffret Méga Dracaufeu-ex Héros Transcendant"
              error={errors.name?.message}
              {...register('name')}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Tape le nom exact du coffret, display, boîte…
            </p>
          </div>

          {/* ── TYPE ── */}
          <div>
            <SectionLabel>Type de produit</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SEALED_TYPE_LABELS) as SealedType[]).map(t => (
                <Chip key={t} active={watchType === t} onClick={() => setValue('type', t)}>
                  {SEALED_TYPE_LABELS[t]}
                </Chip>
              ))}
            </div>
          </div>

          {/* ── EXTENSION ── */}
          <div className="relative">
            <Input
              label="Extension / Set"
              placeholder="Héros Transcendant, Fable Nébuleuse…"
              error={errors.set?.message}
              icon={<Search size={13} />}
              {...register('set')}
            />
            {/* Autocomplete suggestions */}
            {filteredSuggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-[var(--radius-sm)] border overflow-hidden z-10"
                style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
              >
                {filteredSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue('set', s)}
                    className="w-full px-3 py-2 text-[12px] text-left transition-colors hover:bg-[var(--color-bg-glass-hi)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── LANGUE ── */}
          <div>
            <SectionLabel>Langue</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {(['FR', 'EN', 'JP', 'DE', 'ES', 'IT', 'PT'] as const).map(lang => (
                <Chip key={lang} active={watchLang === lang} onClick={() => setValue('language', lang)}>
                  {lang}
                </Chip>
              ))}
            </div>
          </div>

          {/* ── ÉTAT ── */}
          <div>
            <SectionLabel>État</SectionLabel>
            <div className="flex gap-2">
              <Chip active={watchCondition === 'sealed'} onClick={() => setValue('condition', 'sealed')}>
                🔒 Scellé
              </Chip>
              <Chip active={watchCondition === 'opened'} onClick={() => setValue('condition', 'opened')}>
                📦 Ouvert
              </Chip>
            </div>
          </div>

          {/* ── QUANTITÉ + PRIX ── */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantité" type="number" placeholder="1" error={errors.quantity?.message} {...register('quantity')} />
            <Input label="Prix d'achat (€)" type="number" placeholder="89.00" step="0.01" error={errors.purchase_price?.message} {...register('purchase_price')} />
          </div>

          {/* ── DATE ── */}
          <Input label="Date d'achat" type="date" {...register('purchase_date')} />

          {/* ── PHOTO PRODUIT ── */}
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            bucket="sealed-products"
            label="Photo du produit (optionnel)"
            aspectRatio="box"
            maxSizeMB={5}
          />

          {/* ── NOTES ── */}
          <div>
            <SectionLabel>Notes</SectionLabel>
            <textarea
              {...register('notes')}
              placeholder="Acheté à Japan Expo, édition limitée…"
              rows={3}
              className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] resize-none outline-none"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] text-[12px]" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-negative)' }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full justify-center">
            <PackageOpen size={14} />
            Ajouter à mon portfolio
          </Button>
        </form>
      </div>
    </div>
  )
}
