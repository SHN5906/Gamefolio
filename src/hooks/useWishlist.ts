'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWishlist, createWishlistItem, deleteWishlistItem, type WishlistRow, type CreateWishInput } from '@/lib/data/wishlist'

const QK = ['wishlist'] as const

export function useWishlist() {
  return useQuery<WishlistRow[]>({
    queryKey: QK,
    queryFn: () => fetchWishlist(),
    staleTime: 30_000,
  })
}

export function useCreateWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWishInput) => createWishlistItem(input),
    onSuccess: (res) => { if (res.ok) qc.invalidateQueries({ queryKey: QK }) },
  })
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWishlistItem(id),
    onSuccess: (res) => { if (res.ok) qc.invalidateQueries({ queryKey: QK }) },
  })
}
