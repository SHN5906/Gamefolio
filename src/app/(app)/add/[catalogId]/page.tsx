'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { createUserCard } from '@/lib/data/cards'
import { syncAndStorePriceForCard } from '@/lib/data/prices'
import { useQueryClient } from '@tanstack/react-query'

// ── Schéma de validation ──────────────────────────────────────────
const schema = z.object({
  condition:     z.enum(['NM', 'EX', 'GD', 'PL', 'PO']),
  language:      z.enum(['FR', 'EN', 'JP', 'DE', 'ES', 'IT', 'PT']),
  variant:       z.enum(['normal', 'holo', 'reverse', 'fullart', 'secret']),
  is_graded:     z.boolean(),
  grade:         z.string().optional(),
  quantity:      z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 1 : Number(v)),
    z.number().int().min(1).max(999)
  ),
  purchase_price: z.preprocess(
    // Champ optionnel — vide ou NaN → undefined
    (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
  purchase_date:  z.string().optional(),
  notes:         z.string().max(500).optional(),
})
type FormData = z.infer<typeof schema>

// ── Options des selects ───────────────────────────────────────────
const CONDITIONS = [
  { value: 'NM', label: 'Near Mint',   desc: 'Parfait état' },
  { value: 'EX', label: 'Excellent',   desc: 'Légères traces' },
  { value: 'GD', label: 'Good',        desc: 'Utilisé mais correct' },
  { value: 'PL', label: 'Played',      desc: 'Usé' },
  { value: 'PO', label: 'Poor',        desc: 'Très abîmé' },
] as const

const LANGUAGES = [
  { value: 'FR', label: '🇫🇷 Français' },
  { value: 'EN', label: '🇬🇧 Anglais' },
  { value: 'JP', label: '🇯🇵 Japonais' },
  { value: 'DE', label: '🇩🇪 Allemand' },
  { value: 'ES', label: '🇪🇸 Espagnol' },
  { value: 'IT', label: '🇮🇹 Italien' },
  { value: 'PT', label: '🇵🇹 Portugais' },
] as const

const VARIANTS = [
  { value: 'normal',  label: 'Normal' },
  { value: 'holo',    label: 'Holographique' },
  { value: 'reverse', label: 'Reverse Holo' },
  { value: 'fullart', label: 'Full Art' },
  { value: 'secret',  label: 'Secret Rare' },
] as const

// ── Composant petit label de section ─────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
      {children}
    </p>
  )
}

// ── Bouton de sélection (condition, langue, variante) ─────────────
function SelectChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 px-3 rounded-[var(--radius-sm)] text-[12px] font-medium border transition-all duration-150"
      style={{
        background:   active ? 'var(--color-brand)'  : 'var(--color-bg-glass)',
        borderColor:  active ? 'var(--color-brand)'  : 'var(--color-border)',
        color:        active ? 'white'                : 'var(--color-text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function AddCardFormPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()

  const catalogId = decodeURIComponent(params.catalogId as string)
  const cardName  = searchParams.get('name')  ?? catalogId
  const setName   = searchParams.get('set')   ?? ''
  const imgBase   = searchParams.get('img')

  const [saved,    setSaved]   = useState(false)
  const [error,    setError]   = useState<string | null>(null)
  const [loading,  setLoading] = useState(false)
  const [syncMsg,  setSyncMsg] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      condition:      'NM',
      language:       'FR',
      variant:        'normal',
      is_graded:      false,
      quantity:       1,
    },
  })

  const watchCondition  = watch('condition')
  const watchLanguage   = watch('language')
  const watchVariant    = watch('variant')
  const watchIsGraded   = watch('is_graded')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Mode démo sans Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await new Promise(r => setTimeout(r, 600)) // simule un délai
        setSaved(true)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Tu dois être connecté.')
        setLoading(false)
        return
      }

      // 1. Upsert carte dans card_catalog (id = tcgdex_id)
      const { data: catalogCard, error: catalogErr } = await supabase
        .from('card_catalog')
        .upsert({
          id:             catalogId,   // PK text = tcgdex_id
          tcgdex_id:      catalogId,
          name_fr:        cardName,
          set_name_fr:    setName,
          image_url_low:  imgBase ? `${imgBase}/low.webp`  : null,
          image_url_high: imgBase ? `${imgBase}/high.webp` : null,
        }, { onConflict: 'id' })
        .select('id')
        .single()

      if (catalogErr) throw catalogErr

      // 2. Insérer via server action (déclenche aussi la sync prix Cardmarket)
      const result = await createUserCard({
        card_id:            catalogCard.id,
        condition:          data.condition,
        language:           data.language.toLowerCase() as 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'jp',
        variant:            data.variant,
        graded:             data.is_graded,
        grade:              data.is_graded ? data.grade ?? null : null,
        quantity:           data.quantity,
        purchase_price_eur: data.purchase_price ?? null,
        purchase_date:      data.purchase_date && data.purchase_date !== '' ? data.purchase_date : null,
        notes:              data.notes ?? null,
      })

      if (!result.ok) throw new Error(result.error)

      // 3. Sync prix Cardmarket (on attend pour avoir le bon prix dès l'affichage)
      setSyncMsg('Récupération du prix Cardmarket…')
      await syncAndStorePriceForCard(catalogCard.id, catalogId).catch(console.error)

      // 4. Invalide le cache TanStack Query → force le rechargement de la collection
      await queryClient.invalidateQueries({ queryKey: ['user-cards'] })

      setSaved(true)
    } catch (e: unknown) {
      console.error('[AddCard] error:', e)
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message: unknown }).message)
            : JSON.stringify(e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Vue succès ────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-positive-soft)' }}
        >
          <Check size={28} style={{ color: 'var(--color-positive)' }} strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className="text-[20px] font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Carte ajoutée !
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            {cardName} a été ajoutée à ta collection.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => router.push('/add')}
            className="px-5"
            style={{ background: 'var(--color-bg-glass-hi)', color: 'var(--color-text-primary)' }}
          >
            Ajouter une autre
          </Button>
          <Button
            type="button"
            onClick={() => router.push('/collection')}
            className="px-5"
          >
            Voir ma collection
          </Button>
        </div>
      </div>
    )
  }

  // ── Formulaire ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center border transition-colors"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
        <div>
          <h1 className="text-[17px] font-bold tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {cardName}
          </h1>
          {setName && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {setName}
            </p>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex gap-6 max-w-2xl">

          {/* Image de la carte */}
          <div className="flex-shrink-0">
            <div
              className="w-[120px] rounded-[var(--radius-md)] overflow-hidden border"
              style={{
                borderColor: 'var(--color-border)',
                background:  'var(--color-bg-glass)',
                aspectRatio: '2.5 / 3.5',
              }}
            >
              {imgBase ? (
                <Image
                  src={`${imgBase}/high.webp`}
                  alt={cardName}
                  width={120}
                  height={168}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[24px] font-bold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                    {cardName[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 flex flex-col gap-5">

            {/* ── ÉTAT ── */}
            <div>
              <SectionLabel>État</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(({ value, label }) => (
                  <SelectChip
                    key={value}
                    active={watchCondition === value}
                    onClick={() => setValue('condition', value)}
                  >
                    {value} · {label}
                  </SelectChip>
                ))}
              </div>
            </div>

            {/* ── LANGUE ── */}
            <div>
              <SectionLabel>Langue</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(({ value, label }) => (
                  <SelectChip
                    key={value}
                    active={watchLanguage === value}
                    onClick={() => setValue('language', value)}
                  >
                    {label}
                  </SelectChip>
                ))}
              </div>
            </div>

            {/* ── VARIANTE ── */}
            <div>
              <SectionLabel>Variante</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {VARIANTS.map(({ value, label }) => (
                  <SelectChip
                    key={value}
                    active={watchVariant === value}
                    onClick={() => setValue('variant', value)}
                  >
                    {label}
                  </SelectChip>
                ))}
              </div>
            </div>

            {/* ── GRADÉ ── */}
            <div>
              <SectionLabel>Gradé ?</SectionLabel>
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setValue('is_graded', !watchIsGraded)}
                  className="w-10 h-6 rounded-full transition-all duration-200 relative"
                  style={{ background: watchIsGraded ? 'var(--color-brand)' : 'var(--color-bg-glass-hi)' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                    style={{ left: watchIsGraded ? 'calc(100% - 18px)' : '2px' }}
                  />
                </button>
                <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {watchIsGraded ? 'Oui' : 'Non'}
                </span>
              </div>
              {watchIsGraded && (
                <div className="mt-3">
                  <Input
                    label="Note (ex: PSA 10, BGS 9.5)"
                    placeholder="PSA 10"
                    {...register('grade')}
                  />
                </div>
              )}
            </div>

            {/* ── QUANTITÉ + PRIX ── */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantité"
                type="number"
                placeholder="1"
                error={errors.quantity?.message}
                {...register('quantity')}
              />
              <Input
                label="Prix d'achat (€)"
                type="number"
                placeholder="0.00"
                step="0.01"
                error={errors.purchase_price?.message}
                {...register('purchase_price')}
              />
            </div>

            {/* ── DATE D'ACHAT ── */}
            <Input
              label="Date d'achat"
              type="date"
              {...register('purchase_date')}
            />

            {/* ── NOTES ── */}
            <div>
              <SectionLabel>Notes</SectionLabel>
              <textarea
                {...register('notes')}
                placeholder="Acheté à Japan Expo, carte signée…"
                rows={3}
                className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] resize-none outline-none transition-all duration-150"
                style={{
                  background:  'var(--color-bg-glass)',
                  borderColor: 'var(--color-border)',
                  color:       'var(--color-text-primary)',
                }}
              />
            </div>

            {/* ── ERREUR ── */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] text-[12px]"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-negative)' }}
              >
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* ── SUBMIT ── */}
            <Button type="submit" loading={loading} className="w-full justify-center mt-1">
              <Check size={14} />
              {syncMsg ?? 'Ajouter à ma collection'}
            </Button>

          </form>
        </div>
      </div>
    </div>
  )
}
