'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import type { UserCardRow } from '@/lib/data/cards'
import { formatEur } from '@/utils/formatCurrency'

interface Slice { name: string; value: number; color: string }

const ENERGY_COLORS: Record<string, string> = {
  fire:      '#FF6B47',
  water:     '#4FA3FF',
  grass:     '#7BCB68',
  lightning: '#FFD43B',
  psychic:   '#C77DFF',
  fighting:  '#C76040',
  dark:      '#424B5F',
  metal:     '#94A3B8',
  fairy:     '#F8A5C2',
  dragon:    '#6B5BA8',
  colorless: '#A8B2C0',
}

const PALETTE = ['#2A7DFF', '#00D4FF', '#10D9A0', '#F5A623', '#EC4899', '#8B5CF6', '#FF6B47', '#94A3B8', '#FCD34D']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload?: { color: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-[6px] border text-[11px]"
      style={{
        fontFamily: 'var(--font-mono)',
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border-strong)',
        color: 'var(--color-text-primary)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-sm" style={{ background: payload[0].payload?.color }} />
        <span className="font-semibold capitalize">{payload[0].name}</span>
      </div>
      <span style={{ color: 'var(--color-text-muted)' }}>{formatEur(payload[0].value)}</span>
    </div>
  )
}

export function AllocationCharts({ cards }: { cards: UserCardRow[] }) {

  // ── Répartition par type d'énergie ──
  const byEnergy = useMemo(() => {
    const map = new Map<string, number>()
    cards.forEach(c => {
      const energy = (c.types?.[0]?.toLowerCase() ?? 'colorless')
      const value = (c.current_price_eur ?? 0) * c.quantity
      map.set(energy, (map.get(energy) ?? 0) + value)
    })
    return [...map.entries()]
      .map(([name, value]) => ({ name, value, color: ENERGY_COLORS[name] ?? '#94A3B8' }))
      .sort((a, b) => b.value - a.value)
  }, [cards])

  // ── Répartition par set ──
  const bySet = useMemo(() => {
    const map = new Map<string, number>()
    cards.forEach(c => {
      const set = c.set_name_fr ?? c.set_name_en ?? 'Inconnu'
      const value = (c.current_price_eur ?? 0) * c.quantity
      map.set(set, (map.get(set) ?? 0) + value)
    })
    return [...map.entries()]
      .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [cards])

  // ── Répartition par rareté ──
  const byRarity = useMemo(() => {
    const map = new Map<string, number>()
    cards.forEach(c => {
      const rarity = c.rarity ?? c.grade ?? 'Standard'
      const value = (c.current_price_eur ?? 0) * c.quantity
      map.set(rarity, (map.get(rarity) ?? 0) + value)
    })
    return [...map.entries()]
      .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [cards])

  if (cards.length === 0) {
    return (
      <p className="text-[12px] py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
        Pas de cartes pour le moment
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <ChartBlock title="Par énergie" subtitle="Type Pokémon" data={byEnergy} type="donut" />
      <ChartBlock title="Par set" subtitle="Top 8 extensions" data={bySet} type="donut" />
      <ChartBlock title="Par rareté" subtitle="Top 6 raretés" data={byRarity} type="bar" />
    </div>
  )
}

function ChartBlock({ title, subtitle, data, type }: { title: string; subtitle: string; data: Slice[]; type: 'donut' | 'bar' }) {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="rounded-[var(--radius-md)] border p-4" style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}>
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
        <h3 className="text-[13px] font-bold tracking-tight mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      </div>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'donut' ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={80}
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {data.slice(0, 4).map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0
          return (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
              <span className="flex-1 truncate capitalize" style={{ color: 'var(--color-text-secondary)' }}>{s.name}</span>
              <span className="font-mono tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
        {data.length > 4 && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            +{data.length - 4} autres
          </p>
        )}
      </div>
    </div>
  )
}
