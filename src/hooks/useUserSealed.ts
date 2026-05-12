'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserSealed, createUserSealed, deleteUserSealed, type SealedRow, type CreateSealedInput } from '@/lib/data/sealed'

const QK = ['user-sealed'] as const

export function useUserSealed() {
  return useQuery<SealedRow[]>({
    queryKey: QK,
    queryFn: () => fetchUserSealed(),
    staleTime: 30_000,
  })
}

export function useCreateUserSealed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSealedInput) => createUserSealed(input),
    onSuccess: (res) => { if (res.ok) qc.invalidateQueries({ queryKey: QK }) },
  })
}

export function useDeleteUserSealed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUserSealed(id),
    onSuccess: (res) => { if (res.ok) qc.invalidateQueries({ queryKey: QK }) },
  })
}
