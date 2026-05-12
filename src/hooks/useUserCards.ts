'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserCards, createUserCard, updateUserCard, deleteUserCard, type UserCardRow, type CreateCardInput } from '@/lib/data/cards'

const QK = ['user-cards'] as const

// ── Lecture ────────────────────────────────────────────────────────
export function useUserCards() {
  return useQuery<UserCardRow[]>({
    queryKey: QK,
    queryFn: () => fetchUserCards(),
    staleTime: 30_000,
  })
}

// ── Création ───────────────────────────────────────────────────────
export function useCreateUserCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCardInput) => createUserCard(input),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: QK })
    },
  })
}

// ── Update ─────────────────────────────────────────────────────────
export function useUpdateUserCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CreateCardInput> }) => updateUserCard(id, patch),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: QK })
    },
  })
}

// ── Delete ─────────────────────────────────────────────────────────
export function useDeleteUserCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUserCard(id),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: QK })
    },
  })
}
